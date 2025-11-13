const express = require('express');
const cors = require('cors'); 
const { Pool } = require('pg'); 

// --- Configuración del Servidor Express ---
const app = express();
const PORT = 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsear el cuerpo de las peticiones POST (JSON)
app.use(express.json());

// Configuración de la conexión a PostgreSQL

const pool = new Pool({
    user: 'postgres',       
    host: 'localhost',
    database: 'likeme',
    password: '1234',       
    port: 5432,
});

// Prueba de conexión a la base de datos
pool.query('SELECT NOW()')
    .then(res => console.log('Conexión a PostgreSQL exitosa:', res.rows[0].now))
    .catch(err => console.error('Error de conexión a PostgreSQL:', err));


// 1. ENDPOINT GET /posts (Obtener todos los posts)

app.get('/posts', async (req, res) => {
    try {
        // Consulta para obtener todos los posts ordenados por ID
        const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los posts:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener los posts' });
    }
});

// 2. ENDPOINT POST /posts (Crear un nuevo post)
app.post('/posts', async (req, res) => {
    const { titulo, img, descripcion } = req.body;

    // Validación de datos de entrada
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

// 3. ENDPOINT PUT /posts/like/:id (Actualizar likes)
app.put('/posts/like/:id', async (req, res) => {
    const { id } = req.params;
    
    // Consulta para incrementar el contador de likes del post con ese ID
    const query = 'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *';
    const values = [id];

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post no encontrado.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al dar like al post ${id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar los likes' });
    }
});

// 4. ENDPOINT DELETE /posts/:id (Eliminar un post) 
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
    const values = [id];

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post no encontrado para eliminar.' });
        }

        res.status(200).json({ message: 'Post eliminado correctamente', deletedPost: result.rows[0] });
    } catch (error) {
        console.error(`Error al eliminar el post ${id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el post' });
    }
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Like Me escuchando en http://localhost:${PORT}`);
});