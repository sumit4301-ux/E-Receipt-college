// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9OyiuGFhnVpi2heJFKwWuuOioDeZBnJI",
  authDomain: "e-receipt-clg.firebaseapp.com",
  projectId: "e-receipt-clg",
  storageBucket: "e-receipt-clg.firebasestorage.app",
  messagingSenderId: "988992802481",
  appId: "1:988992802481:web:07beba69d4772c4d13dc90",
  measurementId: "G-5W9PE2RVF1"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Application Logic
const $ = s => document.querySelector(s);
const roll = $('#roll');
if (roll) roll.addEventListener('blur', async () => {
  const box = $('#stu'), v = roll.value.trim();
  if (!v) { box.textContent = ''; return; }
  const s = await (await fetch('/api/student/' + encodeURIComponent(v))).json();
  box.textContent = s.name ? [s.name, s.course, s.branch, s.acad_session].join(', ') : 'No student with this roll number.';
});
const book = $('#book');
if (book) {
  const show = () => { const o = book.selectedOptions[0]; $('#range').textContent = o ? 'Serials ' + o.dataset.r : ''; };
  book.addEventListener('change', show); show();
}
const items = $('#items');
if (items) {
  const total = () => { $('#total').textContent = [...items.querySelectorAll('[name=item_amount]')].reduce((s, i) => s + (parseFloat(i.value) || 0), 0).toFixed(2); };
  items.addEventListener('input', total);
  items.addEventListener('click', e => {
    if (e.target.classList.contains('rm') && items.querySelectorAll('.item').length > 1) { e.target.closest('.item').remove(); total(); }
  });
  $('#addrow').addEventListener('click', () => {
    const n = items.querySelector('.item').cloneNode(true);
    n.querySelector('input').value = ''; items.appendChild(n);
  });
  total();
}