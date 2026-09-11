/**
 * Helper central para hablar con el backend PHP.
 * BASE_URL asume que el proyecto vive en http://localhost/drogueria-virtual/
 * Si tu carpeta en htdocs tiene otro nombre, ajusta solo esta línea.
 */
const API_BASE_URL = '/drogueria-virtual/backend/api';

async function apiPost(endpoint, datos) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // envía/recibe la cookie de sesión PHP
      body: JSON.stringify(datos)
    });
    const data = await respuesta.json();
    return { status: respuesta.status, ...data };
  } catch (error) {
    console.error(`Error en apiPost(${endpoint}):`, error);
    return { status: 0, exito: false, mensaje: 'No se pudo conectar con el servidor. Verifica que XAMPP esté activo.' };
  }
}

async function apiGet(endpoint) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await respuesta.json();
    return { status: respuesta.status, ...data };
  } catch (error) {
    console.error(`Error en apiGet(${endpoint}):`, error);
    return { status: 0, exito: false, mensaje: 'No se pudo conectar con el servidor. Verifica que XAMPP esté activo.' };
  }
}
async function apiPut(endpoint, datos) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(datos)
    });
    const data = await respuesta.json();
    return { status: respuesta.status, ...data };
  } catch (error) {
    console.error(`Error en apiPut(${endpoint}):`, error);
    return { status: 0, exito: false, mensaje: 'No se pudo conectar con el servidor.' };
  }
}

async function apiDelete(endpoint) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await respuesta.json();
    return { status: respuesta.status, ...data };
  } catch (error) {
    console.error(`Error en apiDelete(${endpoint}):`, error);
    return { status: 0, exito: false, mensaje: 'No se pudo conectar con el servidor.' };
  }
}