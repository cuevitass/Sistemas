const STORAGE_KEY = 'itr_prestamos_netbooks';

// Elementos del DOM
const studentInput = document.getElementById('student');
const courseInput = document.getElementById('course');
const serialInput = document.getElementById('serial');

const btnRegister = document.getElementById('btnRegister');
const btnReturn = document.getElementById('btnReturn');
const btnHistory = document.getElementById('btnHistory');
const btnClearHistory = document.getElementById('btnClearHistory');

const historyModal = document.getElementById('historyModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const historyContent = document.getElementById('historyContent');

// Obtener datos guardados
function getLoans() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

// Guardar datos
function saveLoans(loans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
}

// 1. Botón: Registrar préstamo
btnRegister.addEventListener('click', () => {
  const student = studentInput.value.trim();
  const course = courseInput.value.trim();
  const serial = serialInput.value.trim();

  if (!student || !course || !serial) {
    alert('Por favor completá el nombre, curso y número de serie.');
    return;
  }

  const loans = getLoans();

  // Verificar si la netbook ya está en préstamo
  const exists = loans.find(
    (l) => l.serial.toLowerCase() === serial.toLowerCase() && l.status === 'En préstamo'
  );

  if (exists) {
    alert(`El equipo con N° de serie "${serial}" ya figura prestado a ${exists.student}.`);
    return;
  }

  const newLoan = {
    id: Date.now(),
    student,
    course,
    serial,
    date: new Date().toLocaleString('es-AR'),
    status: 'En préstamo'
  };

  loans.push(newLoan);
  saveLoans(loans);

  alert(`¡Préstamo registrado correctamente para ${student}!`);

  // Limpiar inputs
  studentInput.value = '';
  courseInput.value = '';
  serialInput.value = '';
});

// 2. Botón: Devolver equipo
btnReturn.addEventListener('click', () => {
  const serial = serialInput.value.trim();
  const loans = getLoans();

  let targetSerial = serial;

  if (!targetSerial) {
    targetSerial = prompt('Ingresá el Número de serie de la netbook a devolver:');
    if (targetSerial) targetSerial = targetSerial.trim();
  }

  if (!targetSerial) return;

  const loan = loans.find(
    (l) => l.serial.toLowerCase() === targetSerial.toLowerCase() && l.status === 'En préstamo'
  );

  if (loan) {
    loan.status = 'Devuelto';
    loan.returnDate = new Date().toLocaleString('es-AR');
    saveLoans(loans);
    alert(`Se registró la devolución del equipo N° de serie "${loan.serial}" (${loan.student}).`);
    serialInput.value = '';
  } else {
    alert(`No se encontró ningún préstamo activo asociado al N° de serie "${targetSerial}".`);
  }
});

// 3. Botón: Ver historial
btnHistory.addEventListener('click', () => {
  const loans = getLoans();

  if (loans.length === 0) {
    historyContent.innerHTML = '<p style="text-align: center; color: #718096;">No hay registros cargados aún.</p>';
  } else {
    historyContent.innerHTML = loans
      .slice()
      .reverse()
      .map(
        (l) => `
        <div class="history-item">
          <div><strong>Alumno:</strong> ${l.student} (${l.course})</div>
          <div><strong>N° de Serie:</strong> ${l.serial}</div>
          <div><strong>Fecha préstamo:</strong> ${l.date}</div>
          ${l.returnDate ? `<div><strong>Fecha devolución:</strong> ${l.returnDate}</div>` : ''}
          <div>
            <span class="badge ${l.status === 'En préstamo' ? 'badge-borrowed' : 'badge-returned'}">
              ${l.status}
            </span>
          </div>
        </div>
      `
      )
      .join('');
  }

  historyModal.style.display = 'flex';
});

// 4. Botón: Borrar historial
btnClearHistory.addEventListener('click', () => {
  const loans = getLoans();

  if (loans.length === 0) {
    alert('El historial ya está vacío.');
    return;
  }

  const confirmClear = confirm('¿Seguro que querés borrar todo el historial? Esta acción no se puede deshacer.');
  if (confirmClear) {
    localStorage.removeItem(STORAGE_KEY);
    alert('Se borró todo el historial de préstamos.');
  }
});

// Eventos para cerrar el modal
btnCloseModal.addEventListener('click', () => {
  historyModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === historyModal) {
    historyModal.style.display = 'none';
  }
});