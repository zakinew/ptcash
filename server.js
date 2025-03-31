const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const users = [];
const secretKey = 'your_secret_key';

app.post('/register', async (req, res) => {
    const { email, password, ref } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword, earnings: 0, referral: ref || null });
    res.json({ message: 'تم التسجيل بنجاح' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'المستخدم غير موجود' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });

    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
    res.json({ token, referralLink: `http://localhost:5000/register?ref=${email}`, earnings: user.earnings });
});

app.post('/withdraw', (req, res) => {
    const { email, amount } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || user.earnings < amount) return res.status(400).json({ message: 'رصيد غير كافٍ' });

    user.earnings -= amount;
    res.json({ message: `تم سحب ${amount}$ عبر PayPal` });
});

app.listen(5000, () => console.log('Server running on port 5000'));
