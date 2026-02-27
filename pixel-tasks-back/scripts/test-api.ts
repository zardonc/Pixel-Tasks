import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3000';

async function testBackend() {
  try {
    console.log("1. Logging in...");
    // Use the admin account attached to the env setup
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });
    
    const token = response.data.token;
    console.log("✅ Login successful. Token:", token.substring(0, 10) + "...");

    // Create authenticated client
    const client = axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("\n2. Fetching Games...");
    try {
      const games = await client.get('/games');
      console.log(`✅ Fetched ${games.data.length} games.`, games.data);
    } catch (e: any) {
      console.error("❌ Games API Error:", e.response?.data || e.message);
    }

    console.log("\n3. Fetching Shop Items...");
    try {
      const shop = await client.get('/shop/items');
      console.log(`✅ Fetched ${shop.data.length} shop items.`, shop.data);
    } catch (e: any) {
      console.error("❌ Shop API Error:", e.response?.data || e.message);
    }

    console.log("\n4. Fetching Achievements...");
    try {
      const ach = await client.get('/achievements');
      console.log(`✅ Fetched ${ach.data.length} achievements.`, ach.data);
    } catch (e: any) {
      console.error("❌ Achievement API Error:", e.response?.data || e.message);
    }

  } catch (error: any) {
    console.error("❌ Global Error:", error.response?.data || error.message);
  }
}

testBackend();
