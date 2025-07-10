const addBtn = document.querySelector('.add-btn');
const transactionsList = document.querySelector('.transactions ul');
const balanceDisplay = document.querySelector('.balance');
const incomeDisplay = document.querySelector('.income-amount');
const expenseDisplay = document.querySelector('.expense-amount');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

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
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const li = document.createElement('li');
  li.innerHTML = `
        <span>${transaction.text}</span>
        <span class="${
          transaction.amount < 0 ? 'expense' : 'income'
        }">${sign}${formatCurrency(Math.abs(transaction.amount))}</span>
    `;
  transactionsList.prepend(li); // newest on top
}

function renderTransactions() {
  transactionsList.innerHTML = '';
  transactions.forEach(addTransactionDOM);
}

function addTransaction() {
  const text = prompt('Enter transaction name:');
  const amountStr = prompt('Enter amount (use minus for expense):');

  if (!text || !amountStr || isNaN(amountStr)) {
    alert('Please enter valid name and number.');
    return;
  }

  const amount = parseFloat(amountStr);

  const transaction = {
    id: Date.now(),
    text: text.trim(),
    amount,
  };

  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
  updateSummary();
}

addBtn.addEventListener('click', addTransaction);


renderTransactions();
updateSummary();
