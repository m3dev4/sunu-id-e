const theme = document.getElementById("theme-select");
const addForm = document.getElementById("myForm");
const title = document.getElementById("title");
const category = document.getElementById("cat-select");
const description = document.getElementById("desc");
const allSuggestions = document.getElementById("allSuggestions");
const updateForm = document.getElementById("updateForm");
const newTitle = document.getElementById("newTitle");
const newDescription = document.getElementById("newDesc");

// Chargement des suggestions
let suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];

// Chargement des themes
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
  theme.value = savedTheme;
}

// -------------------------------------Fonctions-------------------------------------

const createElementAndStyle = (tag, className, content = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;

  return element;
};

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
    }, 1300);
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
           <article class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
             <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                 <span class="text-xs font-semibold uppercase tracking-wide text-primary">
                    Nouvelle idée
                  </span>

                  <h3 class="mt-1 text-lg font-bold leading-snug">
                   ${suggest.title}
                  </h3>
               </div>

                <span class="badge badge-outline badge-primary shrink-0">
                  ${suggest.category}
                </span>
              </div>

              <p class="min-h-12 text-sm leading-relaxed text-base-content/70">
                ${suggest.description}
              </p>

              <div class="mt-5 flex items-center justify-end gap-2 border-t border-base-300 pt-4">
                <button class="btn btn-sm btn-ghost edit-btn" data-id="${suggest.id}">
                  Modifier
                </button>

                <button class="btn btn-sm btn-error btn-outline delete-btn" data-id="${suggest.id}">
                  Supprimer
                </button>
              </div>
          </article>
        `;
      });

      loadingElement.remove();

      allSuggestions.innerHTML = allSuggests.join("");

      resolve();
    }, 1300);
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

const removeSuggest = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (suggestions.length === 0) {
        reject(new Error("Aucune données"));
        return;
      }
      suggestions = suggestions.filter((suggest) => suggest.id !== id);
      saveSuggest(suggestions);
      resolve(suggestions);
    }, 1300);
  });
};

// -------------------------------------Fin Fonctions-------------------------------------

// -------------------------------------Evenement-------------------------------------

theme.addEventListener("change", (e) => {
  const selectTheme = e.target.value;
  document.documentElement.setAttribute("data-theme", selectTheme);
  localStorage.setItem("theme", selectTheme);
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
    renderSuggestion();
  } catch (error) {
    console.log(`Erreur du serveur: ${error}`);
  }
});

allSuggestions.addEventListener("click", async (e) => {
  try {
    const btn = e.target.closest(".edit-btn");
    const btnRemove = e.target.closest(".delete-btn");

    // SUPPRESSION
    if (btnRemove) {
      const idToRemove = Number(btnRemove.dataset.id);
      await removeSuggest(idToRemove);
      renderSuggestion();

      return;
    }

    // UPDATE
    if (btn) {
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
      return;
    }
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
