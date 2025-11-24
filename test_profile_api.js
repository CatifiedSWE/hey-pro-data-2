// Test script to debug profile API
const fetch = require('node-fetch');

async function testProfileAPI() {
  try {
    console.log('Testing profile API endpoint...\n');
    
    // Test 1: Direct API call without auth
    console.log('Test 1: GET /api/profile (no auth)');
    const res1 = await fetch('http://localhost:3000/api/profile');
    console.log('Status:', res1.status);
    const data1 = await res1.json();
    console.log('Response:', JSON.stringify(data1, null, 2));
    console.log('\n---\n');
    
    // Test 2: Check if route exists
    console.log('Test 2: GET /api/gigs (test if API routing works)');
    const res2 = await fetch('http://localhost:3000/api/gigs');
    console.log('Status:', res2.status);
    const data2 = await res2.json();
    console.log('Response preview:', JSON.stringify(data2).substring(0, 200));
    console.log('\n---\n');
    
    // Test 3: Test the catch-all route
    console.log('Test 3: GET /api/test-route (non-existent)');
    const res3 = await fetch('http://localhost:3000/api/test-route');
    console.log('Status:', res3.status);
    const data3 = await res3.json();
    console.log('Response:', JSON.stringify(data3, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProfileAPI();
