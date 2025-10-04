import React, { useState, useEffect } from 'react';
import './Client.css';
import { getClients, createClient, updateClient, deleteClient } from '../../services/clientService';
import Swal from 'sweetalert2';

function ClientPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', identificacion: '', telefono: '', correo: '', direccion: '' });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editId) {
        await updateClient(editId, form);
        await Swal.fire({
          title: '¡Actualizado!',
          text: 'El cliente ha sido actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#10B981',
        });
      } else {
        await createClient(form);
        await Swal.fire({
          title: '¡Creado!',
          text: 'El cliente ha sido creado correctamente.',
          icon: 'success',
          confirmButtonColor: '#10B981',
        });
      }
      await fetchClients();
      setForm({ nombre: '', identificacion: '', telefono: '', correo: '', direccion: '' });
      setEditId(null);
      setShowModal(false);
    } catch (err) {
      await Swal.fire({
        title: 'Error',
        text: editId ? 'Error al actualizar cliente.' : 'Error al crear cliente.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = id => {
    const client = clients.find(c => c.id === id);
    setForm(client);
    setEditId(id);
    setShowModal(true);
  };

  const handleDelete = async id => {
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1F2937',
      color: '#FFFFFF',
    });
    if (resultado.isConfirmed) {
      try {
        setLoading(true);
        await deleteClient(id);
        await fetchClients();
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El cliente ha sido eliminado.',
          icon: 'success',
          confirmButtonColor: '#10B981',
          background: '#1F2937',
          color: '#FFFFFF',
        });
      } catch (err) {
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el cliente.',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAdd = () => {
    setForm({ nombre: '', identificacion: '', telefono: '', correo: '', direccion: '' });
    setEditId(null);
    setShowModal(true);
  };

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2 className="clients-title">Gestión de Clientes</h2>
        <button className="clients-add-button" onClick={handleAdd}>Agregar Cliente</button>
      </div>
      {showModal && (
        <div className="clients-modal-overlay">
          <div className="clients-modal">
            <form onSubmit={handleSubmit} className="clients-form">
              <div className="clients-form-title">{editId ? 'Editar Cliente' : 'Agregar Cliente'}</div>
              <div className="clients-form-grid">
                <div className="clients-input-group">
                  <label className="clients-label" htmlFor="nombre">Nombre</label>
                  <input className="clients-input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
                </div>
                <div className="clients-input-group">
                  <label className="clients-label" htmlFor="identificacion">Identificación</label>
                  <input className="clients-input" name="identificacion" value={form.identificacion} onChange={handleChange} placeholder="Identificación" required />
                </div>
                <div className="clients-input-group">
                  <label className="clients-label" htmlFor="telefono">Teléfono</label>
                  <input className="clients-input" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" required />
                </div>
                <div className="clients-input-group">
                  <label className="clients-label" htmlFor="correo">Correo</label>
                  <input className="clients-input" name="correo" value={form.correo} onChange={handleChange} placeholder="Correo" required />
                </div>
                <div className="clients-input-group clients-input-group--full">
                  <label className="clients-label" htmlFor="direccion">Dirección</label>
                  <input className="clients-input" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" required />
                </div>
              </div>
              <div className="clients-form-buttons">
                <button type="submit" className="clients-save-button">{editId ? 'Actualizar' : 'Agregar'}</button>
                <button type="button" className="clients-cancel-button" onClick={() => { setForm({ nombre: '', identificacion: '', telefono: '', correo: '', direccion: '' }); setEditId(null); setShowModal(false); }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {loading ? (
        <div className="clients-loading">Cargando clientes...</div>
      ) : (
        <div className="clients-grid">
          {clients.length === 0 ? (
            <div className="clients-empty">No hay clientes registrados.</div>
          ) : (
            clients.map(client => (
              <div key={client.id} className="clients-card">
                <div className="clients-card-header">
                  <div>
                    <div className="clients-name">{client.nombre}</div>
                    <div className="clients-info">ID: {client.identificacion}</div>
                    <div className="clients-info">Teléfono: {client.telefono}</div>
                    <div className="clients-info">Correo: {client.correo}</div>
                    <div className="clients-info">Dirección: {client.direccion}</div>
                  </div>
                </div>
                <div className="clients-button-group">
                  <button className="clients-edit-button" onClick={() => handleEdit(client.id)}>Editar</button>
                  <button className="clients-delete-button" onClick={() => handleDelete(client.id)}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ClientPage;
