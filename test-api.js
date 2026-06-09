async function testLogin() {
  try {
    const res = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@shiftly.com', password: 'password' })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text.substring(0, 500));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
testLogin();
