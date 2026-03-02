require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogdb');
        console.log('MongoDB bağlantısı başarılı');

        const users = await User.find({}, 'username email role');
        if (users.length === 0) {
            console.log('Henüz kayıtlı kullanıcı yok.');
            process.exit(0);
        }

        console.log('\nKullanıcılar:');
        users.forEach((u, i) => {
            console.log(`  ${i + 1}. ${u.username} (${u.email}) - Rol: ${u.role}`);
        });

        rl.question('\nAdmin yapmak istediğiniz kullanıcının numarasını girin: ', async (answer) => {
            const index = parseInt(answer) - 1;
            if (index < 0 || index >= users.length) {
                console.log('Geçersiz seçim.');
                process.exit(1);
            }

            const user = users[index];
            user.role = 'admin';
            await user.save();
            console.log(`✅ ${user.username} artık admin!`);
            process.exit(0);
        });
    } catch (error) {
        console.error('Hata:', error.message);
        process.exit(1);
    }
}

makeAdmin();
