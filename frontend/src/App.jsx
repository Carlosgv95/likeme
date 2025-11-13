import axios from "axios";
import { useEffect, useState } from "react";
import Form from "./components/Form";
import Post from "./components/Post";

// URL base de tu servidor backend
const urlBaseServer = "http://localhost:3000";

function App() {
  // Estados para los campos del formulario de nuevo post
  const [titulo, setTitulo] = useState("");
  const [imgSrc, setImgSRC] = useState(""); // Guarda la URL de la imagen que se ingresa
  const [descripcion, setDescripcion] = useState("");
  // Estado para almacenar la lista de posts obtenidos del backend
  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    try {
      const { data: posts } = await axios.get(urlBaseServer + "/posts");
      setPosts([...posts]); // Actualiza el estado 'posts' con los datos recibidos
    } catch (error) {
      console.error("Error al obtener los posts:", error);
    }
  };

  // Función asíncrona para agregar un nuevo post al backend
  const agregarPost = async () => {
    try {
      const post = { titulo, img: imgSrc, descripcion };
      await axios.post(urlBaseServer + "/posts", post);
      
      getPosts();
      
      setTitulo("");
      setImgSRC("");
      setDescripcion("");

    } catch (error) {
      console.error("Error al agregar el post:", error);
      // Aquí podrías mostrar un mensaje de error más amigable al usuario
      alert("No se pudo agregar el post. Asegúrate de que todos los campos estén llenos y la URL de la imagen sea válida.");
    }
  };

  // Usando el PUT
  const like = async (id) => {
    try {
      await axios.put(urlBaseServer + `/posts/like/${id}`);
      getPosts(); // Vuelve a obtener los posts para actualizar los likes en la UI
    } catch (error) {
      console.error("Error al dar like al post:", error);
    }
  };

  // Usando el DELETE
  const eliminarPost = async (id) => {
    try {
      await axios.delete(urlBaseServer + `/posts/${id}`);
      getPosts(); // Vuelve a obtener los posts para actualizar la UI
    } catch (error) {
      console.error("Error al eliminar el post:", error);
      alert("No se pudo eliminar el post.");
    }
  };

  
  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div className="App">
      <h2 className="py-5 text-center">&#128248; Like Me &#128248;</h2>
      <div className="row m-auto px-5">
        <div className="col-12 col-sm-4">
          {/* Componente Form para agregar nuevos posts */}
          <Form
            setTitulo={setTitulo}
            setImgSRC={setImgSRC}
            setDescripcion={setDescripcion}
            agregarPost={agregarPost}
          />
        </div>
        <div className="col-12 col-sm-8 px-5 row posts align-items-start">
          {/* Mapea los posts y renderiza un componente Post por cada uno */}
          {posts.map((post, i) => (
            <Post
              key={i} // Usar post.id como key es más robusto si los IDs son únicos
              post={post}
              like={like}
              eliminarPost={eliminarPost}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;