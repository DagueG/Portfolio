const character = document.getElementById("character");
const characterSize = 30; // Taille du personnage (assumée ici comme un carré de 30x30px)
let targetY;
const speed = 5;
let isMoving = false;
let sectionHeights = []; // Déclaration de sectionHeights en tant que variable globale
let mouseX = 0;
let mouseY = 0;
let sectionLeft, sectionRight;

function get_heights() {
    const heights = [];

    document.querySelectorAll("section").forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = rect.bottom + window.scrollY;

        // Ajouter la combinaison { top, bottom } dans la liste heights
        heights.push({ top: sectionTop, bottom: sectionBottom });
    });

    return heights;
}

// Déplacement uniquement sur l'axe Y pour suivre le curseur
function moveVertically() {
    if (isMoving) return;
    isMoving = true;
    character.classList.add("run"); // Ajouter l'animation de course
    
    function step() {
        let currentY = character.offsetTop;

        // Limiter la position pour éviter que le personnage sorte des bords
        if (targetY < 0) targetY = 0;


        // Détecter la direction verticale
        if (currentY < targetY) {
            // Descend
            character.classList.add("face-down");
            character.classList.remove("face-up");
        } else if (currentY > targetY) {
            // Monte
            character.classList.add("face-up");
            character.classList.remove("face-down");
        }


        if (targetY > document.body.offsetHeight - characterSize) {
            targetY = document.body.offsetHeight - characterSize;
        }

        if (Math.abs(currentY - targetY) <= speed) {
            character.style.top = `${targetY}px`;
            isMoving = false;
            character.classList.remove("run"); // Retirer l'animation de course
            return;
        }

        if (currentY < targetY) currentY += speed;
        else if (currentY > targetY) currentY -= speed;

        character.style.top = `${currentY}px`;
        requestAnimationFrame(step);
    }
    step();
}

function checkSurroundingSections(cursorX, sectionHeightsParam = sectionHeights) {
    const characterX = character.offsetLeft;
    const characterY = character.offsetTop;
    let isSafe = false;

    // Use sectionHeightsParam instead of sectionHeights directly
    sectionHeightsParam.forEach(({ top, bottom }) => {
        if (characterY >= top && characterY <= bottom) {
            isSafe = true;
        }
    });

    if (!isSafe) {
        const leftDistance = characterX;
        const rightDistance = window.innerWidth - characterX - characterSize;

        if (leftDistance < rightDistance) {
            character.style.left = `0px`;
        } else {
            character.style.left = `${window.innerWidth - characterSize}px`;
        }
    }
}

// Trouve le mur le plus proche à gauche et à droite de la balle au même niveau vertical
function findClosestWalls(cursorX) {
    const characterX = character.offsetLeft;
    const characterY = character.offsetTop;
    let closestLeft = 0; // Bordure gauche de la fenêtre
    let closestRight = window.innerWidth - characterSize; // Bordure droite de la fenêtre

    // Parcours des sections pour trouver les murs les plus proches
    document.querySelectorAll("section").forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = rect.bottom + window.scrollY;
        const sectionLeft = rect.left + window.scrollX;
        const sectionRight = rect.right + window.scrollX;

        // Vérifie si la balle est à la même hauteur que la section
        if (characterY >= sectionTop && characterY <= sectionBottom) {

            // Si le mur est à gauche et plus proche que le précédent
            if (sectionRight < characterX && sectionRight > closestLeft) {
                closestLeft = sectionRight;
            }
            // Si le mur est à droite et plus proche que le précédent
            if (sectionLeft > characterX && sectionLeft < closestRight) {
                closestRight = sectionLeft - characterSize;
            }
        }
    });

    // Déterminer si la balle doit se déplacer vers le mur le plus proche
    const distanceToCursor = Math.abs(cursorX - characterX);
    const distanceToLeftWall = Math.abs(closestLeft - cursorX);
    const distanceToRightWall = Math.abs(closestRight - cursorX);

    if (distanceToLeftWall < distanceToCursor && distanceToLeftWall < distanceToRightWall) {
        character.style.left = `${closestLeft}px`; // Déplacer vers le mur gauche
    } else if (distanceToRightWall < distanceToCursor && distanceToRightWall < distanceToLeftWall) {
        character.style.left = `${closestRight}px`; // Déplacer vers le mur droit
    }
}

function updateWallPosition() {
    const characterX = character.offsetLeft;

    if (character.offsetLeft <= 0) {
        // Ninja est sur le mur de gauche
        character.classList.add("left-wall");
        character.classList.remove("right-wall");
    } else if (character.offsetLeft >= window.innerWidth - characterSize) {
        // Ninja est sur le mur de droite
        character.classList.add("right-wall");
        character.classList.remove("left-wall");
    } else if (characterX <= sectionLeft) {
        // Ninja est sur le mur droit (section gauche)
        character.classList.add("right-wall");
        character.classList.remove("left-wall");
    } else if (characterX >= sectionRight - characterSize) {
        // Ninja est sur le mur gauche (section droite)
        character.classList.add("left-wall");
        character.classList.remove("right-wall");
    } else {
        // Ninja n'est pas sur les murs de la section
        character.classList.remove("left-wall", "right-wall");
    }

}

// Appeler get_heights au chargement de la page pour initialiser sectionHeights
window.addEventListener("load", () => {
    sectionHeights = get_heights(); // Stockage des hauteurs dans la variable globale
    character.style.left = `0px`;
    character.style.top = `${document.body.offsetHeight - characterSize}px`;
    const firstSection = document.querySelector("section");
    if (firstSection) {
        const rect = firstSection.getBoundingClientRect();
        sectionLeft = rect.left + window.scrollX;
        sectionRight = rect.right + window.scrollX;
    }
});

// Suivre la position verticale du curseur sur l'axe Y uniquement
window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX + window.scrollX; // Position horizontale avec défilement
    mouseY = e.clientY + window.scrollY; // Position verticale avec défilement
});

setInterval(() => {
    // Utiliser la position de la souris pour les fonctions nécessaires
    targetY = mouseY; // Mettre à jour la position verticale cible
    moveVertically(); // Appeler la fonction de mouvement vertical
    findClosestWalls(mouseX); // Appeler avec la position X de la souris
    // Appeler la fonction de vérification des sections environnantes
    checkSurroundingSections(null, sectionHeights);
    updateWallPosition();
}, 100);