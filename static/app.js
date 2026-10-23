// ==========================================
// 1. FIREBASE INITIALIZATION & SYNC SETUP
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your exact Firebase configuration keys from Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyDA6zREA...",
  authDomain: "e-receipt-e803f.firebaseapp.com",
  projectId: "e-receipt-e803f",
  storageBucket: "e-receipt-e803f.appspot.com",
  messagingSenderId: "30548207472",
  appId: "1:30548207472:web:2bb69775dd648fcf9f11b5"
};

// Initialize Firebase & Firestore database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Optional: Real-time listener to sync/watch data changes across all 10 computers
onSnapshot(collection(db, "receipts"), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      console.log("New receipt synced from another computer:", change.doc.data());
      // You can add notification logic or auto-refresh table here if needed
    }
  });
});


// ==========================================
// 2. YOUR EXISTING UI LOGIC
// ==========================================
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


// ==========================================
// 3. SAVE RECEIPT TO FIREBASE FIRESTORE
// ==========================================
const receiptForm = $('#receiptForm'); // Make sure your <form> has id="receiptForm"
if (receiptForm) {
  receiptForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Gather item amounts and details
    const itemDetails = [...items.querySelectorAll('.item')].map(item => ({
      description: item.querySelector('[name=item_desc]')?.value || '',
      amount: parseFloat(item.querySelector('[name=item_amount]')?.value) || 0
    }));

    const receiptData = {
      rollNo: roll.value.trim(),
      studentInfo: $('#stu').textContent,
      bookNumber: book.value,
      items: itemDetails,
      totalAmount: $('#total').textContent,
      timestamp: new Date()
    };

    try {
      // Save to Firebase Cloud Database (Syncs to all 10 computers instantly)
      await addDoc(collection(db, "receipts"), receiptData);
      alert('Receipt saved successfully and synced across all computers!');
      receiptForm.reset();
      $('#stu').textContent = '';
      total();
    } catch (error) {
      console.error("Error saving receipt: ", error);
      alert('Error saving receipt. Please check your connection.');
    }
  });
}