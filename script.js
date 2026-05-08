import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAN7j2zNiBM98q-bs9V8ikgPH3f30qX6qU",
  authDomain: "togo-ava.firebaseapp.com",
  projectId: "togo-ava",
  storageBucket: "togo-ava.firebasestorage.app",
  messagingSenderId: "755464395586",
  appId: "1:755464395586:web:e30b1364aae4cbd66f86db",
  measurementId: "G-7JG4ZJFDFW",
  databaseURL:"https://togo-ava-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const todosRef = ref(db, "todos");

if (window.location.protocol === "file:") {
  console.warn("file:// 환경에서는 Firebase 동작이 제한될 수 있습니다. 로컬 서버로 실행하세요.");
}

try {
  getAnalytics(app);
} catch (error) {
  // Analytics can fail in unsupported environments (e.g. local file opening).
  console.warn("Firebase Analytics 초기화에 실패했습니다.", error);
}

const form = document.querySelector("#todo-form");
const categoryInput = document.querySelector("#todo-category");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");

let todos = [];
const CATEGORY_ORDER = ["운동", "공부", "일상"];

renderTodos();
subscribeTodos();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  try {
    await push(todosRef, {
      text,
      category: categoryInput.value,
      createdAtMs: Date.now(),
    });
    input.value = "";
  } catch (error) {
    alert(buildFirebaseErrorMessage("할 일 저장", error));
    console.error("할 일 추가 실패:", error);
  }
});

function subscribeTodos() {
  onValue(
    todosRef,
    (snapshot) => {
      const data = snapshot.val() || {};
      todos = Object.entries(data)
        .map(([id, value]) => ({
          id,
          ...value,
        }))
        .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
      renderTodos();
    },
    (error) => {
      console.error("할 일 목록 실시간 구독 실패:", error);
      alert(buildFirebaseErrorMessage("할 일 목록 불러오기", error));
    }
  );
}

function renderTodos() {
  list.innerHTML = "";

  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "아직 할 일이 없어요.";
    list.appendChild(empty);
    return;
  }

  const grouped = groupTodosByCategory(todos);

  CATEGORY_ORDER.forEach((category) => {
    const categoryTodos = grouped[category];
    if (!categoryTodos || categoryTodos.length === 0) {
      return;
    }

    const block = document.createElement("li");
    block.className = "category-block";

    const title = document.createElement("h2");
    title.className = "category-title";
    title.textContent = category;

    const categoryList = document.createElement("ul");
    categoryList.className = "category-items";

    categoryTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.type = "button";
    editButton.textContent = "수정";
    editButton.addEventListener("click", () => editTodo(todo.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    actions.append(editButton, deleteButton);
    li.append(text, actions);
      categoryList.appendChild(li);
    });

    block.append(title, categoryList);
    list.appendChild(block);
  });
}

function groupTodosByCategory(items) {
  return items.reduce(
    (acc, todo) => {
      const category = CATEGORY_ORDER.includes(todo.category) ? todo.category : "일상";
      acc[category].push(todo);
      return acc;
    },
    {
      운동: [],
      공부: [],
      일상: [],
    }
  );
}

async function editTodo(id) {
  const target = todos.find((item) => item.id === id);
  if (!target) {
    return;
  }

  const nextText = prompt("할 일을 수정하세요", target.text);
  if (nextText === null) {
    return;
  }

  const trimmed = nextText.trim();
  if (!trimmed) {
    alert("빈 내용으로는 수정할 수 없습니다.");
    return;
  }

  try {
    const todoRef = ref(db, `todos/${id}`);
    await update(todoRef, { text: trimmed });
  } catch (error) {
    alert(buildFirebaseErrorMessage("수정", error));
    console.error("할 일 수정 실패:", error);
  }
}

async function deleteTodo(id) {
  try {
    const todoRef = ref(db, `todos/${id}`);
    await remove(todoRef);
  } catch (error) {
    alert(buildFirebaseErrorMessage("삭제", error));
    console.error("할 일 삭제 실패:", error);
  }
}

function buildFirebaseErrorMessage(action, error) {
  const code = error?.code || "unknown";
  const map = {
    PERMISSION_DENIED: "Realtime Database 규칙에서 쓰기/읽기가 거부되었습니다.",
    "permission-denied": "Firestore 보안 규칙에서 쓰기/읽기가 거부되었습니다.",
    "failed-precondition": "Realtime Database/권한 설정을 확인해주세요.",
    unavailable: "네트워크 또는 Firebase 서비스 연결 상태를 확인해주세요.",
    unauthenticated: "인증이 필요한 규칙입니다. 로그인 기능을 붙여야 합니다.",
  };

  const reason = map[code] || "브라우저 콘솔의 에러 로그를 확인해주세요.";
  return `${action} 실패 (${code})\n${reason}`;
}
