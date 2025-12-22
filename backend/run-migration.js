require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
    console.log('🚀 Migration başlatılıyor...\n');

    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    };

    let connection;

    try {
        // SQL dosyasını oku
        const sqlFilePath = path.join(__dirname, '..', 'database', 'create_database.sql');
        console.log(`📄 SQL dosyası okunuyor: ${sqlFilePath}`);
        let sqlContent = await fs.readFile(sqlFilePath, 'utf8');

        // CREATE DATABASE ve USE komutlarını kaldır (zaten veritabanı var)
        sqlContent = sqlContent.replace(/CREATE DATABASE.*?;/gi, '');
        sqlContent = sqlContent.replace(/USE.*?;/gi, '');
        sqlContent = sqlContent.replace(/SHOW DATABASES.*?;/gi, '');

        console.log('✅ SQL dosyası okundu\n');

        // Bağlantı oluştur
        console.log('⏳ Veritabanına bağlanılıyor...');
        connection = await mysql.createConnection(config);
        console.log('✅ Bağlantı başarılı!\n');

        // Migration'ı çalıştır
        console.log('📊 Tablolar oluşturuluyor...');
        await connection.query(sqlContent);
        console.log('✅ Tablolar başarıyla oluşturuldu!\n');

        // Oluşturulan tabloları listele
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`📋 Toplam ${tables.length} tablo oluşturuldu:`);
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`   ${index + 1}. ${tableName}`);
        });

        // Her tablo için yapıyı göster
        console.log('\n📐 Tablo Yapıları:\n');
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [columns] = await connection.query(`DESCRIBE ${tableName}`);
            console.log(`\n🔹 ${tableName.toUpperCase()}:`);
            columns.forEach(col => {
                console.log(`   - ${col.Field} (${col.Type}) ${col.Key ? `[${col.Key}]` : ''}`);
            });
        }

        console.log('\n\n✨ Migration başarıyla tamamlandı!');

    } catch (error) {
        console.error('\n❌ Migration Hatası:', error.message);
        console.error('\n📝 Hata Detayları:');
        console.error(`   Kod: ${error.code}`);
        console.error(`   SQL State: ${error.sqlState}`);
        if (error.sql) {
            console.error(`   SQL: ${error.sql.substring(0, 200)}...`);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Bağlantı kapatıldı.');
        }
    }
}

// Migration'ı çalıştır
runMigration();
