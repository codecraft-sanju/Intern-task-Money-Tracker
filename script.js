feather.replace();

const addBtn = document.querySelector('.add-btn');
const modal = document.getElementById('modal');
const form = document.getElementById('transaction-form');
const closeBtn = document.querySelector('.close-btn');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const transactionsList = document.querySelector('.transactions ul');
const emptyState = document.querySelector('.empty-state');
const balanceDisplay = document.querySelector('.balance');
const incomeDisplay = document.querySelector('.income-amount');
const expenseDisplay = document.querySelector('.expense-amount');
const toast = document.getElementById('toast');
const darkToggle = document.getElementById('darkModeToggle');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editId = null;

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
  })}`;
}

function updateSummary() {
  const amounts = transactions.map((t) => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const income = amounts
    .filter((v) => v > 0)
    .reduce((acc, v) => acc + v, 0)
    .toFixed(2);
  const expense = Math.abs(
    amounts.filter((v) => v < 0).reduce((acc, v) => acc + v, 0),
  ).toFixed(2);

  balanceDisplay.textContent = formatCurrency(total);
  incomeDisplay.textContent = formatCurrency(income);
  expenseDisplay.textContent = formatCurrency(expense);

  updateChart(income, expense);
}

function checkEmpty() {
  emptyState.style.display = transactions.length ? 'none' : 'block';
}

function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function addTransactionDOM(transaction) {
  const li = document.createElement('li');
  li.classList.add(transaction.amount < 0 ? 'expense' : 'income');
  li.innerHTML = `
    <div class="details">
      <span>${transaction.text}</span><br>
      <span>${transaction.amount < 0 ? '-' : '+'}${formatCurrency(
    Math.abs(transaction.amount),
  )}</span>
    </div>
    <div class="actions">
      <button onclick="editTransaction(${
        transaction.id
      })" title="Edit"><i data-feather="edit"></i></button>
      <button onclick="deleteTransaction(${
        transaction.id
      })" title="Delete"><i data-feather="trash-2"></i></button>
    </div>
  `;
  transactionsList.prepend(li);
  feather.replace();
}

function renderTransactions() {
  transactionsList.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  checkEmpty();
}

function saveAndUpdate() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
  updateSummary();
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveAndUpdate();
  showToast('Transaction deleted!');
}

function editTransaction(id) {
  const t = transactions.find((t) => t.id === id);
  if (!t) return;
  descInput.value = t.text;
  amountInput.value = t.amount;
  editId = id;
  modal.style.display = 'flex';
}

addBtn.onclick = () => {
  modal.style.display = 'flex';
  form.reset();
  editId = null;
};

closeBtn.onclick = () => {
  modal.style.display = 'none';
  form.reset();
  editId = null;
};

form.onsubmit = (e) => {
  e.preventDefault();
  const text = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  if (!text || isNaN(amount)) {
    alert('Please enter valid details!');
    return;
  }
  if (editId) {
    transactions = transactions.map((t) =>
      t.id === editId ? { ...t, text, amount } : t,
    );
    showToast('Transaction updated!');
  } else {
    const transaction = { id: Date.now(), text, amount };
    transactions.push(transaction);
    showToast('Transaction added!');
  }
  saveAndUpdate();
  modal.style.display = 'none';
  form.reset();
  editId = null;
};

window.onclick = (e) => {
  if (e.target == modal) modal.style.display = 'none';
};

darkToggle.onclick = () => {
  document.body.classList.toggle('dark-mode');
  const icon = document.querySelector('#darkModeToggle i');
  icon.setAttribute(
    'data-feather',
    document.body.classList.contains('dark-mode') ? 'sun' : 'moon',
  );
  localStorage.setItem(
    'theme',
    document.body.classList.contains('dark-mode') ? 'dark' : 'light',
  );
  feather.replace();
};

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  const icon = document.querySelector('#darkModeToggle i');
  icon.setAttribute('data-feather', 'sun');
}
feather.replace();

let chart;
function updateChart(income, expense) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [
        { data: [income, expense], backgroundColor: ['#27ae60', '#e74c3c'] },
      ],
    },
    options: { responsive: true, cutout: '60%' },
  });
}

renderTransactions();
updateSummary();
