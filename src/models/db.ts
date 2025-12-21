import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STR}`,
});

export const initDB = async () => {
  // 1. Users Table (Facebook Style Profile)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password VARCHAR(255) NOT NULL,
      gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
      date_of_birth DATE,
      profile_pic VARCHAR(255) DEFAULT 'default_avatar.png',
      otp_code VARCHAR(10),
      cover_pic VARCHAR(255),
      bio TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      is_online BOOLEAN DEFAULT FALSE,
      last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT email_or_phone_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
    );
  `);

  // 2. Posts Table (User posts with Caption & Image/Video)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      caption TEXT,
      media_url VARCHAR(255), -- Image or Video Link
      media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'text')),
      privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
      location VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Stories Table (24 hours expiration logic handled in query usually)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stories (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_url VARCHAR(255) NOT NULL,
      media_type VARCHAR(20) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
    );
  `);

  // 4. Messages Table (Socket.io এর চ্যাট হিস্ট্রি সেভ করার জন্য)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message_text TEXT,
      media_url VARCHAR(255),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Follows/Friends Table (রিলেশনশিপ মেইনটেইন করার জন্য)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS follows (
      follower_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (follower_id, following_id) -- একজন আরেকজনকে একবারই ফলো করতে পারবে
    );
  `);

  console.log("Addaghor Tables Created Successfully!");
};

console.log("Db connected.................");
