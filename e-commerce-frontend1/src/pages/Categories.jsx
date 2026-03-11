import { Link } from "react-router-dom";
import "../styles/Categories.css";

const categories = [
  { id: 1, name: "Electronics", slug: "electronics", image: "https://tse2.mm.bing.net/th/id/OIP.Jefrc8kc7jfxgdVM-frVPgHaE8?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 2, name: "Fashions", slug: "fashions", image: "https://media.istockphoto.com/photos/men-clothing-on-a-rack-closeup-photo-picture-id626224550?k=6&m=626224550&s=612x612&w=0&h=7wGBNF4-7u9xHS5M0hbMMhyUPEluba4UY9TgVvpWarI=" },
  { id: 3, name: "Sports", slug: "sports", image: "https://thumbs.dreamstime.com/b/sports-equipment-recreation-leisure-grass-football-basketball-baseball-golf-soccer-tennis-ball-volleyball-cricket-46209832.jpg" },
  { id: 4, name: "Home Appliances", slug: "home-appliances", image: "https://media.istockphoto.com/photos/set-of-home-kitchen-appliances-in-the-room-on-the-wall-background-picture-id1197532896?k=20&m=1197532896&s=612x612&w=0&h=_A6d9owUkjAruAfIfhxJj1AKKolr6dh954zIC0iQPik=" },
  { id: 5, name: "Toys", slug: "toys", image: "https://img.freepik.com/free-photo/many-colorful-toys-collection-desk_488220-17581.jpg?w=2000" },
  { id: 6, name: "Jewelleries", slug: "jewelleries", image: "https://tse3.mm.bing.net/th/id/OIP.0qozXbVSuEmUOql4a-yLoQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 7, name: "Footwears", slug: "footwears", image: "https://tse1.mm.bing.net/th/id/OIP.UyPBamddpfMuGr1gmlppHAHaEY?w=600&h=355&rs=1&pid=ImgDetMain&o=7&rm=3r" },
  { id: 8, name: "Books", slug: "books", image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?cs=srgb&dl=bookcase-books-bookshelf-1370295.jpg&fm=jpg" },
  { id: 9, name: "Beauty", slug: "beauty", image: "https://img.freepik.com/premium-photo/creative-cosmetics-composition-advertisement-commercial-photoshoot_950002-53998.jpg" },
  { id: 10, name: "Automotives", slug: "automotive-spares", image: "https://png.pngtree.com/background/20231018/original/pngtree-3d-rendered-robot-painting-cars-in-automated-automotive-factory-picture-image_5598092.jpg" },
  { id: 11, name: "Bags & Luggage", slug: "bags-luggages", image: "https://tse2.mm.bing.net/th/id/OIP.IfqGIqvfnq7ZHC3cEEWrYgHaE8?w=960&h=640&rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 12, name: "Watches", slug: "watches", image: "https://tse1.mm.bing.net/th/id/OIP.5R3GCqlVyswSRABRWPAunwHaE8?w=1536&h=1024&rs=1&pid=ImgDetMain&o=7&rm=3" },
];    

const Categories = () => (
  <div className="categories-page">
    <h2>CATEGORIES</h2>
    <div className="category-grid">
      {categories.map(cat => (
        <Link key={cat.id} to={`/category/${cat.slug}`} className="category-card">
          <img src={cat.image} alt={cat.name} />
          <p>{cat.name}</p>
        </Link>
      ))}
    </div>
  </div>
);

export default Categories;