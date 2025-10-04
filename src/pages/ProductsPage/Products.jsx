import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";
import Swal from "sweetalert2";
import "./Products.css";

function ProductsComponent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });

  // Cargar productos al iniciar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError("Error al cargar los productos");
      console.error("Error detallado:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos requeridos
    if (!formData.name || !formData.price || !formData.category) {
      setError("Nombre, precio y categoría son campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Preparar datos según el modelo de producto
      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description || "",
        image: formData.image || "",
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        await Swal.fire({
          title: "¡Actualizado!",
          text: "El producto ha sido actualizado correctamente.",
          icon: "success",
          confirmButtonColor: "#10B981",
        });
      } else {
        await createProduct(productData);
        await Swal.fire({
          title: "¡Creado!",
          text: "El producto ha sido creado correctamente.",
          icon: "success",
          confirmButtonColor: "#10B981",
        });
      }

      await loadProducts();
      resetForm();
    } catch (err) {
      setError(
        editingProduct
          ? "Error al actualizar producto"
          : "Error al crear producto"
      );
      console.error("Error detallado:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      price: product.price ? product.price.toString() : "",
      category: product.category || "",
      description: product.description || "",
      image: product.image || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1F2937",
      color: "#FFFFFF",
    });

    if (resultado.isConfirmed) {
      try {
        setLoading(true);
        await deleteProduct(id);
        await loadProducts();
        await Swal.fire({
          title: "¡Eliminado!",
          text: "El producto ha sido eliminado.",
          icon: "success",
          confirmButtonColor: "#10B981",
          background: "#1F2937",
          color: "#FFFFFF",
        });
      } catch (err) {
        setError("Error al eliminar producto");
        console.error("Error detallado:", err);
        await Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el producto.",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      image: "",
    });
    setEditingProduct(null);
    setShowForm(false);
    setError(null);
  };

  if (loading && products.length === 0) {
    return <div className="products-loading">Cargando productos...</div>;
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1 className="products-title">Gestión de Productos</h1>
        <button
          className="products-add-button"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? "Cancelar" : "Agregar Producto"}
        </button>
      </div>

      {error && <div className="products-error">{error}</div>}

      {showForm && (
        <form className="products-form" onSubmit={handleSubmit}>
          <h3 className="products-form-title">
            {editingProduct ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          <div className="products-form-grid">
            <div className="products-input-group">
              <label className="products-label">
                Nombre del producto<span className="products-required">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Ingresa el nombre del producto"
                value={formData.name}
                onChange={handleInputChange}
                className="products-input"
                required
              />
            </div>
            
            <div className="products-input-group">
              <label className="products-label">
                Precio<span className="products-required">*</span>
              </label>
              <input
                type="number"
                name="price"
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
                className="products-input"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="products-input-group">
              <label className="products-label">
                Categoría<span className="products-required">*</span>
              </label>
              <input
                type="text"
                name="category"
                placeholder="Ingresa la categoría"
                value={formData.category}
                onChange={handleInputChange}
                className="products-input"
                required
              />
            </div>
            
            <div className="products-input-group products-input-group--full">
              <label className="products-label">URL de la imagen</label>
              <input
                type="text"
                name="image"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={formData.image}
                onChange={handleInputChange}
                className="products-input"
              />
            </div>
            
            <div className="products-input-group products-input-group--full">
              <label className="products-label">Descripción</label>
              <textarea
                name="description"
                placeholder="Describe el producto..."
                value={formData.description}
                onChange={handleInputChange}
                className="products-textarea"
              />
            </div>
          </div>
          <div className="products-form-buttons">
            <button
              type="button"
              className="products-cancel-button"
              onClick={resetForm}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="products-save-button"
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : editingProduct
                ? "Actualizar"
                : "Guardar"}
            </button>
          </div>
        </form>
      )}

      {!loading && products.length === 0 ? (
        <div className="products-empty">
          No hay productos disponibles. ¡Agrega el primero!
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="products-card">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="products-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div className="products-card-header">
                <div>
                  <h3 className="products-product-name">{product.name}</h3>
                  <p className="products-product-info">
                    Categoría: {product.category}
                  </p>
                </div>
              </div>
              <div className="products-price">${product.price}</div>
              {product.description && (
                <p className="products-description">{product.description}</p>
              )}
              <div className="products-button-group">
                <button
                  className="products-edit-button"
                  onClick={() => handleEdit(product)}
                  disabled={loading}
                >
                  Editar
                </button>
                <button
                  className="products-delete-button"
                  onClick={() => handleDelete(product.id)}
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsComponent;