// Firebase Config
const firebaseConfig = {
    authDomain: "sinif-not-defteri.firebaseapp.com",
    databaseURL: "https://sinif-not-defteri-default-rtdb.firebaseio.com",
    projectId: "sinif-not-defteri",
    storageBucket: "sinif-not-defteri.firebasestorage.app",
    messagingSenderId: "727775093847",
    appId: "1:727775093847:web:9131ced077aa3ad28f6f12",
    measurementId: "G-F869E3229E"
};

// Initialize Firebase
let db;
let isFirebaseInitialized = false;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    isFirebaseInitialized = true;
    console.log("Firebase initialized successfully");
} catch (e) {
    console.error("Error initializing Firebase:", e);
    alert("Firebase Başlatma Hatası:\n" + e.message);
}

// UI Elements
const tabNotes = document.getElementById('tab-notes');
const tabTodos = document.getElementById('tab-todos');
const notesList = document.getElementById('notes-list');
const todosList = document.getElementById('todos-list');
const inputTitle = document.getElementById('input-title');
const inputContent = document.getElementById('input-content');
const btnAdd = document.getElementById('btn-add');
const btnAddFolder = document.getElementById('btn-add-folder');
const folderList = document.getElementById('folder-list');

// State
let currentTab = 'notes';
let currentFolderId = 'all'; // 'all' or specific folder ID
let folderMap = {}; // Map folderId -> folderName

// Listeners references to unsubscribe
let notesUnsubscribe = null;
let todosUnsubscribe = null;

// Event Listeners
if (tabNotes) tabNotes.addEventListener('click', () => switchTab('notes'));
if (tabTodos) tabTodos.addEventListener('click', () => switchTab('todos'));
if (btnAdd) btnAdd.addEventListener('click', handleAdd);
if (btnAddFolder) btnAddFolder.addEventListener('click', createFolder);

// Folder Selection
folderList.addEventListener('click', (e) => {
    if (e.target.classList.contains('folder-item')) {
        selectFolder(e.target.dataset.id);
    }
});

function switchTab(tab) {
    currentTab = tab;
    // ... UI updates ...
    if (tab === 'notes') {
        tabNotes.classList.add('active');
        tabTodos.classList.remove('active');
        notesList.classList.remove('hidden-view');
        notesList.classList.add('active-view');
        todosList.classList.add('hidden-view');
        todosList.classList.remove('active-view');
        inputTitle.style.display = 'block';
        inputContent.placeholder = "Notunuzu buraya yazın...";
        // Re-fetch to apply current folder filter if switched back
        fetchNotes();
        // Todos listener is always active but we could optimize
    } else {
        tabTodos.classList.add('active');
        tabNotes.classList.remove('active');
        todosList.classList.remove('hidden-view');
        todosList.classList.add('active-view');
        notesList.classList.add('hidden-view');
        notesList.classList.remove('active-view');
        inputTitle.style.display = 'none';
        inputContent.placeholder = "Yapılacak işi yazın...";
    }
}

function selectFolder(folderId) {
    currentFolderId = folderId;

    // Update UI
    document.querySelectorAll('.folder-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.folder-item[data-id="${folderId}"]`);
    if (activeItem) activeItem.classList.add('active');

    fetchNotes();
}

function createFolder() {
    const folderName = prompt("Klasör Adı:");
    if (!folderName) return;

    if (isFirebaseInitialized) {
        db.collection("folders").add({
            name: folderName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => alert("Klasör oluşturma hatası: " + err.message));
    }
}

function handleAdd() {
    const title = inputTitle.value.trim();
    const content = inputContent.value.trim();

    if (!content) {
        alert("Lütfen bir içerik girin.");
        return;
    }

    const collectionName = currentTab === 'notes' ? 'notes' : 'todos';

    // Store folderId as null if 'all', otherwise the specific ID
    const newItem = {
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        type: currentTab,
        folderId: currentFolderId === 'all' ? null : currentFolderId,
        folderName: (currentFolderId !== 'all' && folderMap[currentFolderId]) ? folderMap[currentFolderId] : null
    };

    if (currentTab === 'notes') {
        newItem.title = title;
    } else {
        newItem.isCompleted = false;
    }

    inputTitle.value = '';
    inputContent.value = '';

    if (isFirebaseInitialized) {
        db.collection(collectionName).add(newItem)
            .catch((error) => {
                console.error("Error adding document: ", error);
                alert("Ekleme Hatası: " + error.message);
            });
    }
}

// Real-time listeners
if (isFirebaseInitialized) {
    // Listen for Folders
    db.collection("folders").orderBy("createdAt", "asc")
        .onSnapshot(snapshot => {
            // Keep "All" and clear others
            const allBtn = folderList.querySelector('[data-id="all"]');
            folderList.innerHTML = '';
            folderList.appendChild(allBtn);

            folderMap = {}; // Reset map

            snapshot.forEach(doc => {
                const data = doc.data();
                folderMap[doc.id] = data.name; // Store name

                const folderEl = createFolderElement(doc.id, data);
                folderList.appendChild(folderEl);
            });

            // Re-highlight active folder
            selectFolder(currentFolderId);

            // Re-render notes AND todos to reflect name changes
            fetchNotes();
            fetchTodos();
        });

    fetchNotes();
    fetchTodos();
}

function fetchNotes() {
    if (!isFirebaseInitialized) return;

    if (notesUnsubscribe) notesUnsubscribe();

    let query = db.collection("notes").orderBy("createdAt", "desc");

    if (currentFolderId !== 'all') {
        query = query.where("folderId", "==", currentFolderId);
    }

    notesUnsubscribe = query.onSnapshot(snapshot => {
        notesList.innerHTML = '';
        if (snapshot.empty) {
            notesList.innerHTML = '<div class="empty-state">Bu klasörde not yok.</div>';
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            // Pass folder name if exists (Prioritize live map, then stored name)
            const folderName = (data.folderId && folderMap[data.folderId]) || data.folderName || null;
            const navItem = createNoteElement(doc.id, data, folderName);
            notesList.appendChild(navItem);
        });
    }, (error) => {
        console.error("Notlar çekilirken hata:", error);
        if (error.message.includes("requires an index")) {
            alert("⚠️ veritabanı İndeksi Eksik!\n\nLütfen Konsol (F12) üzerinden linke tıklayın.");
        }
    });
}

function fetchTodos() {
    if (!isFirebaseInitialized) return;

    if (todosUnsubscribe) todosUnsubscribe();

    // Todos are currently global, but we could add filtering here too if desired
    // For now we just list all in descending order
    todosUnsubscribe = db.collection("todos").orderBy("createdAt", "desc")
        .onSnapshot(snapshot => {
            todosList.innerHTML = '';
            if (snapshot.empty) todosList.innerHTML = '<div class="empty-state">Yapılacak bir şey yok.</div>';
            snapshot.forEach(doc => {
                const data = doc.data();
                const folderName = (data.folderId && folderMap[data.folderId]) || data.folderName || null;
                const todoItem = createTodoElement(doc.id, data, folderName);
                todosList.appendChild(todoItem);
            });
        });
}

function createFolderElement(id, data) {
    const div = document.createElement('div');
    div.className = 'folder-item';
    div.dataset.id = id;
    div.innerHTML = `
        ${data.name} 
        <button class="folder-delete-btn" title="Sil">×</button>
    `;

    // Drop Zone Events
    div.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
        div.classList.add('drag-over');
    });

    div.addEventListener('dragleave', () => {
        div.classList.remove('drag-over');
    });

    div.addEventListener('drop', (e) => {
        e.preventDefault();
        div.classList.remove('drag-over');

        try {
            const rawData = e.dataTransfer.getData("application/json");
            if (rawData) {
                const dragData = JSON.parse(rawData);
                if (dragData && dragData.id && dragData.collection) {
                    moveItemToFolder(dragData.id, dragData.collection, id);
                }
            }
        } catch (err) {
            console.error("Drop Parse Error", err);
        }
    });

    // Delete Folder
    div.querySelector('.folder-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm("Bu klasörü silmek istediğinize emin misiniz? İçindeki notlar silinmez, 'Tüm Notlar'a düşer.")) {
            db.collection("folders").doc(id).delete();
            // Reset to All if current deleted
            if (currentFolderId === id) selectFolder('all');
        }
    });

    return div;
}

function createNoteElement(id, data, folderName) {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.draggable = true; // Enable Drag

    // Folder badge HTML
    const folderBadge = folderName ? `<span class="note-folder-badge">${folderName}</span>` : '';

    div.innerHTML = `
        <div class="item-header">
            ${data.title ? `<div class="item-title">${data.title}</div>` : '<div></div>'}
            <button class="btn-delete" data-id="${id}" type="button">×</button>
        </div>
        <div class="item-content">${data.content}</div>
        <div class="item-footer">
            ${folderBadge}
        </div>
    `;

    // Drag Start
    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ id: id, collection: "notes" }));
        div.style.opacity = '0.5';
    });

    div.addEventListener('dragend', () => {
        div.style.opacity = '1';
    });

    div.querySelector('.btn-delete').addEventListener('click', () => {
        db.collection("notes").doc(id).delete();
    });

    return div;
}

function createTodoElement(id, data, folderName) {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.draggable = true; // Enable Drag for Todos

    const folderBadge = folderName ? `<span class="note-folder-badge" style="margin-left:auto">${folderName}</span>` : '';

    div.innerHTML = `
        <div class="todo-item">
            <input type="checkbox" class="todo-checkbox" ${data.isCompleted ? 'checked' : ''}>
            <div class="item-content todo-text ${data.isCompleted ? 'completed' : ''}">${data.content}</div>
            ${folderBadge}
            <button class="btn-delete" style="margin-left: 0.5rem;" data-id="${id}" type="button">×</button>
        </div>
    `;

    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ id: id, collection: "todos" }));
        div.style.opacity = '0.5';
    });

    div.addEventListener('dragend', () => {
        div.style.opacity = '1';
    });

    div.querySelector('.todo-checkbox').addEventListener('change', (e) => {
        // Optimistic UI update
        const textEl = div.querySelector('.todo-text');
        if (e.target.checked) {
            textEl.classList.add('completed');
        } else {
            textEl.classList.remove('completed');
        }

        db.collection("todos").doc(id).update({
            isCompleted: e.target.checked
        }).catch(err => {
            console.error("Update failed", err);
            // Revert changes if failed
            e.target.checked = !e.target.checked;
            if (e.target.checked) textEl.classList.add('completed');
            else textEl.classList.remove('completed');
            alert("Güncelleme hatası: " + err.message);
        });
    });

    div.querySelector('.btn-delete').addEventListener('click', () => {
        db.collection("todos").doc(id).delete();
    });

    return div;
}

function moveItemToFolder(itemId, collection, folderId) {
    const folderName = folderMap[folderId] || null;
    db.collection(collection).doc(itemId).update({
        folderId: folderId,
        folderName: folderName
    }).then(() => {
        console.log("Item moved to " + folderId);
    }).catch(err => alert("Taşıma hatası: " + err.message));
}
