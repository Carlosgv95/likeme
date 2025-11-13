
const express = require('express');
const cors = require('cors'); // Requerimiento 1
const { Pool } = require('pg'); // Requerimiento 2

// --- Configuración del Servidor Express ---
const app = express();
const PORT = 3000;

// Middleware para habilitar CORS (Requerimiento 1)
app.use(cors());

// Middleware para parsear el cuerpo de las peticiones POST (JSON)
app.use(express.json());

const pool = new Pool({
    user: 'postgres',      // <-- ¡Cambia esto a tu usuario de Postgres!
    host: 'localhost',
    database: 'likeme',
    password: '1234', // <-- ¡Cambia esto a tu contraseña!
    port: 5432,
});

pool.query('SELECT NOW()')
    .then(res => console.log('Conexión a PostgreSQL exitosa:', res.rows[0].now))
    .catch(err => console.error('Error de conexión a PostgreSQL:', err));

app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY id');
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los posts:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener los posts' });
    }
});

app.post('/posts', async (req, res) => {
    const { titulo, img, descripcion } = req.body;

  
    if (!titulo || !img || !descripcion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: titulo, img y descripcion.' });
    }

    const query = 'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, 0) RETURNING *';
    const values = [titulo, img, descripcion];

    try {
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear el post:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear el post' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor Like Me escuchando en http://localhost:${PORT}`);
    
});