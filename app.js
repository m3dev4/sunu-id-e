const theme = document.getElementById("theme-select");
const addForm = document.getElementById("myForm");
const title = document.getElementById("title");
const category = document.getElementById("cat-select");
const description = document.getElementById("desc");
const allSuggestions = document.getElementById("allSuggestions");
const updateForm = document.getElementById("updateForm");
const newTitle = document.getElementById("newTitle");
const newDescription = document.getElementById("newDesc");

let suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];

// -------------------------------------Fonctions-------------------------------------

const createElementAndStyle = (tag, className, content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;

  return element;
};

// Fonction ajou dans le localstorage
const saveSuggest = (suggest) => {
  return new Promise((resolve, reject) => {
    if (suggest) {
      localStorage.setItem("suggestions", JSON.stringify(suggestions));
      resolve(suggestions);
    } else {
      console.log("Erreur lors du save des données dans le localstorage");
      reject(suggestions);
    }
  });
};

const addSuggest = (suggest) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (suggest) {
        suggestions.push(suggest);
        resolve(suggestions);
      } else {
        console.log("Erreur lors du creation");
        reject(suggestions);
      }
    }, 2000);
  });
};

const renderSuggestion = () => {
  return new Promise((resolve, reject) => {
    const dataContainer = document.querySelector(".data-container");
    const allSuggestions = document.getElementById("allSuggestions");

    const loadingElement = createElementAndStyle("div", "text-center text-lg font-bold my-5", "Loading...");

    dataContainer.appendChild(loadingElement);

    setTimeout(() => {
      const allSuggests = suggestions.map((suggest) => {
        return `
          <div class="rounded-2xl border border-base-300 bg-base-100/80 p-5 shadow-sm backdrop-blur-md transition hover:-translate-y-1 hover:shadow-lg relative">
            <div class="flex flex-col gap-3">
              
              <div class="flex items-start justify-between gap-3">
                <h3 class="text-lg font-semibold leading-tight text-base-content">
                  ${suggest.title}
                </h3>

                <small class="badge badge-secondary">
                  ${suggest.category}
                </small>
              </div>

              <p class="text-sm leading-relaxed text-base-content/70">
                ${suggest.description}
              </p>

              <div class="flex items-center gap-5 mt-4">
                <button class="btn btn-accent edit-btn" data-id="${suggest.id}">
                  <span>Mettre à jour</span>
                </button>

                <button class="btn btn-error delete-btn" data-id="${suggest.id}">
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        `;
      });

      loadingElement.remove();

      allSuggestions.innerHTML = allSuggests.join("");

      resolve();
    }, 2000);
  });
};

const updateSuggest = (id, newTitle, newDescription) => {
  return new Promise((resolve) => {
    suggestions = suggestions.map((suggest) => {
      if (suggest.id === id) {
        return {
          ...suggest,
          title: newTitle,
          description: newDescription,
        };
      }
      return suggest;
    });
    saveSuggest(suggestions);

    resolve(suggestions);
  });
};

// -------------------------------------Fin Fonctions-------------------------------------

// -------------------------------------Evenement-------------------------------------

theme.addEventListener("change", () => {
  document.documentElement.setAttribute("data-theme", theme.value);
});

addForm.addEventListener("submit", async (e) => {
  try {
    e.preventDefault();
    const newSuggest = {
      id: Date.now(),
      title: title.value.trim(),
      category: category.value,
      description: description.value.trim(),
    };
    await addSuggest(newSuggest);
    await saveSuggest(newSuggest);
    alert("Suggestion crée avec succes");
  } catch (error) {
    console.log(`Erreur du serveur: ${error}`);
  }
});

allSuggestions.addEventListener("click", async (e) => {
  try {
    const btn = e.target.closest(".edit-btn");

    if (!btn) return;

    const id = Number(btn.dataset.id);

    const suggestEdit = suggestions.find((suggest) => suggest.id === id);

    if (!suggestEdit) {
      console.log("Suggestion introuvable");
      return;
    }

    newTitle.value = suggestEdit.title;
    newDescription.value = suggestEdit.description;

    updateForm.dataset.id = id;

    my_modal_3.showModal();

    console.log("ID à modifier :", id);
  } catch (error) {
    console.log(error);
  }
});

updateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = Number(updateForm.dataset.id);

    await updateSuggest(id, newTitle.value.trim(), newDescription.value.trim());
    await renderSuggestion();
    my_modal_3.close();
  } catch (error) {
    console.log("Error", error);
  }
});

// -------------------------------------Fin Evenement-------------------------------------

async function main() {
  try {
    await renderSuggestion();
  } catch (error) {}
}

main();
