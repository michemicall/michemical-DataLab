const menu = document.querySelector('.menu-icon');
const linksDiv = document.querySelector('.links-div');
const menuLinks = document.querySelectorAll('.links-div a');
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon');
const resultsContainer = document.getElementById('resultsContainer');

// Menú hamburguesa
menu.addEventListener('click', (e) => {
    e.stopPropagation();
    linksDiv.classList.toggle('active');
    
    if (linksDiv.classList.contains('active')) {
        menu.classList.remove('fa-bars');
        menu.classList.add('fa-times');
    } else {
        menu.classList.add('fa-bars');
        menu.classList.remove('fa-times');
    }
});

menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        linksDiv.classList.remove('active');
        menu.classList.add('fa-bars');
        menu.classList.remove('fa-times');
    });
});

document.addEventListener('click', (e) => {
    if (!linksDiv.contains(e.target) && e.target !== menu && linksDiv.classList.contains('active')) {
        linksDiv.classList.remove('active');
        menu.classList.add('fa-bars');
        menu.classList.remove('fa-times');
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && linksDiv.classList.contains('active')) {
        linksDiv.classList.remove('active');
        menu.classList.add('fa-bars');
        menu.classList.remove('fa-times');
    }
});

// Función para mostrar resultados corregidos
function showResults(data, isRUC) {
  resultsContainer.innerHTML = '';
  
  if (isRUC) {
    // Formatear dirección
    const direccion = data.direccion
      .replace(/\./g, '')
      .replace(/,,/g, ',')
      .replace(/\s+/g, ' ')
      .trim();
    
    resultsContainer.innerHTML = `
      <div class="result-header ruc-section">
        <h2 class="result-title">${data.razon_social}</h2>
        <div class="result-type">RUC: ${data.ruc}</div>
      </div>
      
      <div class="data-section">
        <h3 class="section-title">Información de la Empresa</h3>
        <div class="data-list">
          <div class="data-item">
            <span class="data-label">Razón Social</span>
            <span class="data-value">${data.razon_social}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Dirección</span>
            <span class="data-value">${direccion}</span>
          </div>
        </div>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = `
      <div class="result-header dni-section">
        <h2 class="result-title">${data.apellido_paterno} ${data.apellido_materno}, ${data.nombres}</h2>
        <div class="result-type">DNI: ${data.numero}</div>
      </div>
      
      <div class="data-section">
        <h3 class="section-title">Datos Personales</h3>
        <div class="data-list">
          <div class="data-item">
            <span class="data-label">Nombres</span>
            <span class="data-value">${data.nombres}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Apellido Paterno</span>
            <span class="data-value">${data.apellido_paterno}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Apellido Materno</span>
            <span class="data-value">${data.apellido_materno}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  resultsContainer.style.display = 'block';
  
  // Desplazar suavemente a los resultados
  setTimeout(() => {
    resultsContainer.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, 300);
}

// Función para mostrar errores
function showError(message) {
  resultsContainer.innerHTML = `
    <div class="error-message">
      <i class="fa fa-exclamation-triangle"></i>
      <p>${message}</p>
    </div>
  `;
  resultsContainer.style.display = 'block';
  
  setTimeout(() => {
    resultsContainer.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, 300);
}

// Función para mostrar carga
function showLoader() {
  resultsContainer.innerHTML = `
    <div class="loader">
      <i class="fa fa-spinner"></i>
      <p>Buscando información...</p>
    </div>
  `;
  resultsContainer.style.display = 'block';
  
  setTimeout(() => {
    resultsContainer.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, 300);
}

// Función para validar y buscar
async function searchData() {
  const query = searchInput.value.trim();
  
  // Validaciones básicas
  if (!query) {
    showError('Por favor ingrese un RUC o DNI');
    return;
  }
  
  if (!/^\d+$/.test(query)) {
    showError('Solo se permiten números');
    return;
  }
  
  showLoader();
  
  try {
    // Determinar si es RUC (11 dígitos) o DNI (8 dígitos)
    if (query.length === 11) {
      // Consultar API RUC
      const response = await fetch(`http://localhost:3002/ruc/${query}`);
      
      if (!response.ok) {
        throw new Error('RUC no encontrado o error en la API');
      }
      
      const data = await response.json();
      showResults(data, true);
      
    } else if (query.length === 8) {
      // Consultar API DNI
      const response = await fetch(`http://127.0.0.1:5000/${query}`);
      
      if (!response.ok) {
        throw new Error('DNI no encontrado o error en la API');
      }
      
      const data = await response.json();
      
      // Ajuste para la estructura de la API DNI
      if (data.success && data.data) {
        showResults(data.data, false);
      } else {
        throw new Error('La API DNI no devolvió datos válidos');
      }
      
    } else {
      throw new Error('Debe ingresar 8 dígitos para DNI o 11 para RUC');
    }
  } catch (error) {
    showError(error.message || 'Error en la consulta. Intente nuevamente.');
    console.error('Error en la búsqueda:', error);
  }
}

// Eventos de búsqueda
searchIcon.addEventListener('click', searchData);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchData();
  }
});

// Cerrar resultados al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!resultsContainer.contains(e.target) && 
      !searchInput.contains(e.target) && 
      !searchIcon.contains(e.target)) {
    resultsContainer.style.display = 'none';
  }
});

// Limpiar resultados al enfocar el campo de búsqueda
searchInput.addEventListener('focus', () => {
  resultsContainer.style.display = 'none';
});