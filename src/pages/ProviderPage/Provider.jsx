import { useEffect, useState } from "react";
import {
	getProviders,
	createProvider,
	updateProvider,
	deleteProvider,
} from "../../services/providerService";
import Swal from "sweetalert2";
import "./Provider.css";

function ProviderPage() {
	const [providers, setProviders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [editingProvider, setEditingProvider] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		nit: "",
		phone: "",
		email: "",
		address: "",
		cityCountry: "",
		category: "",
		description: "",
		status: "Activo",
	});

	useEffect(() => {
		loadProviders();
	}, []);

	const loadProviders = async () => {
		try {
			setLoading(true);
			setError(null);
			const list = await getProviders();
			setProviders(list);
		} catch (err) {
			console.error(err);
			setError("Error al cargar los proveedores");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name || !formData.nit || !formData.email) {
			setError("Nombre, NIT e Email son obligatorios");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const payload = { ...formData };

			if (editingProvider) {
				await updateProvider(editingProvider.id, payload);
				await Swal.fire({
					title: "Actualizado",
					text: "Proveedor actualizado correctamente",
					icon: "success",
					confirmButtonColor: "#10B981",
				});
			} else {
				await createProvider(payload);
				await Swal.fire({
					title: "Creado",
					text: "Proveedor creado correctamente",
					icon: "success",
					confirmButtonColor: "#10B981",
				});
			}

			await loadProviders();
			resetForm();
		} catch (err) {
			console.error(err);
			setError(
				editingProvider
					? "Error al actualizar proveedor"
					: "Error al crear proveedor"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (provider) => {
		setEditingProvider(provider);
		setFormData({
			name: provider.name || "",
			nit: provider.nit || "",
			phone: provider.phone || "",
			email: provider.email || "",
			address: provider.address || "",
			cityCountry: provider.cityCountry || "",
			category: provider.category || "",
			description: provider.description || "",
			status: provider.status || "Activo",
		});
		setShowForm(true);
	};

	const handleDelete = async (id) => {
		const res = await Swal.fire({
			title: "¿Estás seguro?",
			text: "Esta acción no se puede deshacer",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#EF4444",
			cancelButtonColor: "#6B7280",
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
			background: "#1F2937",
			color: "#FFFFFF",
		});

		if (res.isConfirmed) {
			try {
				setLoading(true);
				await deleteProvider(id);
				await loadProviders();
				await Swal.fire({
					title: "Eliminado",
					text: "Proveedor eliminado correctamente",
					icon: "success",
					confirmButtonColor: "#10B981",
				});
			} catch (err) {
				console.error(err);
				setError("Error al eliminar proveedor");
			} finally {
				setLoading(false);
			}
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			nit: "",
			phone: "",
			email: "",
			address: "",
			cityCountry: "",
			category: "",
			description: "",
			status: "Activo",
		});
		setEditingProvider(null);
		setShowForm(false);
		setError(null);
	};

	if (loading && providers.length === 0) {
		return <div className="providers-loading">Cargando proveedores...</div>;
	}

	return (
		<div className="providers-container">
			<div className="providers-header">
				<h1 className="providers-title">Gestión de Proveedores</h1>
				<button
					className="providers-add-button"
					onClick={() => setShowForm(!showForm)}
					disabled={loading}
				>
					{showForm ? "Cancelar" : "Agregar Proveedor"}
				</button>
			</div>

			{error && <div className="providers-error">{error}</div>}

			{showForm && (
				<form className="providers-form" onSubmit={handleSubmit}>
					<h3 className="providers-form-title">
						{editingProvider ? "Editar Proveedor" : "Nuevo Proveedor"}
					</h3>
					<div className="providers-form-grid">
						<div className="providers-input-group">
							<label className="providers-label">Nombre del proveedor *</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								className="providers-input"
								placeholder="Nombre del proveedor"
								required
							/>
						</div>

						<div className="providers-input-group">
							<label className="providers-label">NIT / Identificación *</label>
							<input
								type="text"
								name="nit"
								value={formData.nit}
								onChange={handleInputChange}
								className="providers-input"
								placeholder="900123456-7"
								required
							/>
						</div>

						<div className="providers-input-group">
							<label className="providers-label">Teléfono</label>
							<input
								type="tel"
								name="phone"
								value={formData.phone}
								onChange={handleInputChange}
								className="providers-input"
								placeholder="+57 300 123 4567"
							/>
						</div>

						<div className="providers-input-group">
							<label className="providers-label">Correo electrónico *</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleInputChange}
								className="providers-input"
								placeholder="correo@proveedor.com"
								required
							/>
						</div>

						<div className="providers-input-group providers-input-group--full">
							<label className="providers-label">Dirección</label>
							<input
								type="text"
								name="address"
								value={formData.address}
								onChange={handleInputChange}
								className="providers-input"
								placeholder="Calle 123 #45-67"
							/>
						</div>

						<div className="providers-input-group">
							<label className="providers-label">Ciudad / País</label>
							<input
								type="text"
								name="cityCountry"
								value={formData.cityCountry}
								onChange={handleInputChange}
								className="providers-input"
								placeholder="Bogotá, Colombia"
							/>
						</div>

						<div className="providers-input-group">
							<label className="providers-label">Categoría</label>
							<input
								type="text"
								name="category"
								value={formData.category}
								onChange={handleInputChange}
								className="providers-input"
								placeholder="Tenis, Shorts, etc."
							/>
						</div>

						<div className="providers-input-group providers-input-group--full">
							<label className="providers-label">Descripción</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								className="providers-textarea"
								placeholder="Descripción del proveedor"
							/>
						</div>

						<div className="providers-input-group">
							<label className="providers-label">Estado</label>
							<select
								name="status"
								value={formData.status}
								onChange={handleInputChange}
								className="providers-input"
							>
								<option value="Activo">Activo</option>
								<option value="Inactivo">Inactivo</option>
							</select>
						</div>
					</div>

					<div className="providers-form-buttons">
						<button
							type="button"
							className="providers-cancel-button"
							onClick={resetForm}
							disabled={loading}
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="providers-save-button"
							disabled={loading}
						>
							{loading ? "Guardando..." : editingProvider ? "Actualizar" : "Guardar"}
						</button>
					</div>
				</form>
			)}

			{!loading && providers.length === 0 ? (
				<div className="providers-empty">No hay proveedores. ¡Agrega el primero!</div>
			) : (
				<div className="providers-grid">
					{providers.map((p) => (
						<div key={p.id} className="providers-card">
							<div className="providers-card-header">
								<div>
									<h3 className="providers-name">{p.name}</h3>
									<p className="providers-info">NIT: {p.nit}</p>
									{p.category && (
										<p className="providers-info">Categoría: {p.category}</p>
									)}
									{p.cityCountry && (
										<p className="providers-info">Ubicación: {p.cityCountry}</p>
									)}
								</div>
								<span
									className={
										p.status === "Activo" ? "badge badge--success" : "badge badge--muted"
									}
								>
									{p.status}
								</span>
							</div>
							{p.description && (
								<p className="providers-description">{p.description}</p>
							)}
							<div className="providers-button-group">
								<button
									className="providers-edit-button"
									onClick={() => handleEdit(p)}
									disabled={loading}
								>
									Editar
								</button>
								<button
									className="providers-delete-button"
									onClick={() => handleDelete(p.id)}
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

export default ProviderPage;

