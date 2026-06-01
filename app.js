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

const saveSuggest = () => {
  localStorage.setItem("suggestions", JSON.stringify(suggestions));
};

const addSuggest = (suggest) => {
  if (!suggest) {
    throw new Error("Erreur lors du creation");
  }

  suggestions.push(suggest);
  saveSuggest();
  return suggestions;
};

const renderSuggestion = () => {
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

  allSuggestions.innerHTML = allSuggests.join("");
};

const updateSuggest = (id, newTitle, newDescription) => {
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

  saveSuggest();
  return suggestions;
};

const removeSuggest = (id) => {
  if (suggestions.length === 0) {
    throw new Error("Aucune données");
  }

  suggestions = suggestions.filter((suggest) => suggest.id !== id);
  saveSuggest();
  return suggestions;
};

const predictCategory = async (title) => {
  try {
    const prompt = `
      Tu dois choisir une catégorie pour cette idée : ${title}

      Les catégories sont :
      - Pédagogie
      - Événement
      - Vie de campus
      - Amélioration technique

      Réponds uniquement par le nom exact de la catégorie sans aucune explication.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur du serveur: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("Reponse ollama", data);

    const predictedCategory = data.response?.trim();

    if (!predictedCategory) {
      console.log("Aucune catégorie prédite");
      return;
    }

    console.log("Catégorie prédite :", predictedCategory);

    category.value = predictedCategory; // change automatiquement la valeur du champ catégorie avec la catégorie trouvée par Ollama.
    category.dispatchEvent(new Event("change"));

    console.log("Valeur actuelle du select :", category.value);
  } catch (error) {
    console.log("Erreur lors de la prédiction de la catégorie", error);
  }
};

// -------------------------------------Fin Fonctions-------------------------------------

// -------------------------------------Evenement-------------------------------------

theme.addEventListener("change", (e) => {
  const selectTheme = e.target.value;
  document.documentElement.setAttribute("data-theme", selectTheme);
  localStorage.setItem("theme", selectTheme);
});

addForm.addEventListener("submit", (e) => {
  try {
    e.preventDefault();
    const newSuggest = {
      id: Date.now(),
      title: title.value.trim(),
      category: category.value,
      description: description.value.trim(),
    };
    addSuggest(newSuggest);
    alert("Suggestion crée avec succes");
    renderSuggestion();
  } catch (error) {
    console.log(`Erreur du serveur: ${error}`);
  }
});

allSuggestions.addEventListener("click", (e) => {
  try {
    const btn = e.target.closest(".edit-btn");
    const btnRemove = e.target.closest(".delete-btn");

    // SUPPRESSION
    if (btnRemove) {
      const idToRemove = Number(btnRemove.dataset.id);
      removeSuggest(idToRemove);
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

updateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const id = Number(updateForm.dataset.id);

    updateSuggest(id, newTitle.value.trim(), newDescription.value.trim());
    renderSuggestion();
    my_modal_3.close();
  } catch (error) {
    console.log("Error", error);
  }
});

title.addEventListener("blur", async (e) => {
  const titleValue = e.target.value.trim();

  if (!titleValue) return;
  await predictCategory(titleValue);
});

// -------------------------------------Fin Evenement-------------------------------------

function main() {
  try {
    renderSuggestion();
  } catch (error) {}
}

main();
