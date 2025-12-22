require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
    console.log('🔍 Veritabanı bağlantısı test ediliyor...\n');

    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectTimeout: 10000
    };

    console.log('📋 Bağlantı Bilgileri:');
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Password: ${'*'.repeat(config.password?.length || 0)}\n`);

    let connection;

    try {
        // Bağlantı oluştur
        console.log('⏳ Bağlantı kuruluyor...');
        connection = await mysql.createConnection(config);
        console.log('✅ Bağlantı başarılı!\n');

        // Veritabanı versiyonunu kontrol et
        const [versionRows] = await connection.query('SELECT VERSION() as version');
        console.log(`📊 MySQL Versiyonu: ${versionRows[0].version}`);

        // Mevcut veritabanını kontrol et
        const [dbRows] = await connection.query('SELECT DATABASE() as db');
        console.log(`📁 Aktif Veritabanı: ${dbRows[0].db}`);

        // Tabloları listele
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n📑 Toplam Tablo Sayısı: ${tables.length}`);

        if (tables.length > 0) {
            console.log('\n📋 Tablolar:');
            tables.forEach((table, index) => {
                const tableName = Object.values(table)[0];
                console.log(`   ${index + 1}. ${tableName}`);
            });
        }

        // Bağlantı durumunu test et
        const [pingResult] = await connection.query('SELECT 1 as ping');
        console.log(`\n🏓 Ping Testi: ${pingResult[0].ping === 1 ? 'Başarılı' : 'Başarısız'}`);

        console.log('\n✨ Tüm testler başarıyla tamamlandı!');

    } catch (error) {
        console.error('\n❌ Bağlantı Hatası:', error.message);
        console.error('\n📝 Hata Detayları:');
        console.error(`   Kod: ${error.code}`);
        console.error(`   Errno: ${error.errno}`);
        console.error(`   SQL State: ${error.sqlState}`);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Çözüm Önerileri:');
            console.error('   - MySQL sunucusunun çalıştığından emin olun');
            console.error('   - Host ve port bilgilerini kontrol edin');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Çözüm Önerileri:');
            console.error('   - Kullanıcı adı ve şifrenizi kontrol edin');
            console.error('   - Kullanıcının uzaktan bağlantı izni olduğundan emin olun');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n💡 Çözüm Önerileri:');
            console.error('   - Veritabanı adının doğru olduğundan emin olun');
            console.error('   - Veritabanının oluşturulduğundan emin olun');
        }

        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Bağlantı kapatıldı.');
        }
    }
}

// Test fonksiyonunu çalıştır
testDatabaseConnection();
