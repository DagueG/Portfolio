const character = document.getElementById("character");
const characterSize = 30; // Taille du personnage (assumée ici comme un carré de 30x30px)
let targetY; // La position cible en Y
const speed = 2; // Vitesse constante pour les mouvements
let isMoving = false; // Flag pour contrôler le mouvement continu
let currentSide = "left"; // Indicateur du côté où se trouve le personnage (gauche ou droite)

// Positionner le personnage en bas à gauche de la page au chargement
window.addEventListener("load", () => {
    character.style.left = `0px`; // Collé au bord gauche
    character.style.top = `${document.body.offsetHeight - characterSize}px`; // En bas de la page
});

// Déplacement uniquement sur l'axe Y pour suivre le curseur
function moveVertically() {
    if (isMoving) return; // Empêche les mouvements multiples simultanés
    isMoving = true;

    function step() {
        let currentY = character.offsetTop;

        // Limiter la position de la balle pour qu'elle ne dépasse pas le bord supérieur ou inférieur
        if (targetY < 0) targetY = 0; // Limite supérieure
        if (targetY > document.body.offsetHeight - characterSize) {
            targetY = document.body.offsetHeight - characterSize; // Limite inférieure
        }

        // Si le personnage est déjà proche de la cible en Y, on arrête le mouvement
        if (Math.abs(currentY - targetY) <= speed) {
            character.style.top = `${targetY}px`;
            isMoving = false;
            return;
        }

        // Déplacement en fonction de la position cible sur l'axe Y
        if (currentY < targetY) currentY += speed; // Descendre
        else if (currentY > targetY) currentY -= speed; // Monter

        // Mettre à jour la position du personnage
        character.style.top = `${currentY}px`;

        requestAnimationFrame(step);
    }

    step();
}

// Vérifie l'obstacle le plus proche à droite (si sur le bord gauche) ou à gauche (si sur le bord droit)
function checkAndJump(cursorX) {
    let characterX = currentSide === "left" ? 0 : window.innerWidth - characterSize; // Position actuelle de la balle
    let closestObstacle;
    let distanceToObstacle;

    if (currentSide === "left") {
        // Initialise leftmostBorder avec le côté droit de l'écran
        let leftmostBorder = window.innerWidth - characterSize;
    
        // Parcours chaque section pour trouver le bord gauche le plus proche à droite de la balle
        document.querySelectorAll("section").forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = rect.bottom + window.scrollY;
            const sectionLeft = rect.left + window.scrollX;
    
            // Vérifie si la balle est alignée verticalement avec la section
            if (character.offsetTop <= sectionTop && character.offsetTop >= sectionBottom) {
                // Si le bord gauche de la section est plus à gauche que le leftmostBorder actuel
                if (sectionLeft < leftmostBorder) {
                    leftmostBorder = sectionLeft;
                }
            }
        });
    
        // Calcul de la distance jusqu'au leftmostBorder
        closestObstacle = leftmostBorder;
        distanceToObstacle = Math.abs(leftmostBorder - cursorX);
    } else {
        // Initialise rightmostBorder avec le côté gauche de l'écran
        let rightmostBorder = 0;
    
        // Parcours chaque section pour trouver le bord droit le plus proche à gauche de la balle
        document.querySelectorAll("section").forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = rect.bottom + window.scrollY;
            const sectionRight = rect.right + window.scrollX;
    
            // Vérifie si la balle est alignée verticalement avec la section
            if (character.offsetTop <= sectionTop && character.offsetTop >= sectionBottom) {
                // Si le bord droit de la section est plus à droite que le rightmostBorder actuel
                if (sectionRight > rightmostBorder) {
                    rightmostBorder = sectionRight;
                }
            }
        });
    
        // Calcul de la distance jusqu'au rightmostBorder
        closestObstacle = rightmostBorder;
        distanceToObstacle = Math.abs(cursorX - rightmostBorder);
    }

    // Log pour voir la position X de la balle, l'obstacle le plus proche et la souris
    console.log("Coté de la balle:", currentSide);
    console.log("Position X de la balle:", characterX);
    console.log("Position X de l'obstacle le plus proche:", closestObstacle.x);
    console.log("Position X de la souris:", cursorX);

    // Sauter si le curseur est plus proche de l'obstacle que de la position actuelle de la balle
    const distanceToCursor = Math.abs(cursorX - characterX);
    if (distanceToCursor > distanceToObstacle) {
        character.style.left = `${closestObstacle.x}px`;
        currentSide = closestObstacle.x === 0 ? "left" : "right"; // Mettre à jour le côté actuel
    }
}

// Suivre la position verticale du curseur sur l'axe Y uniquement
window.addEventListener("mousemove", (e) => {
    targetY = e.clientY + window.scrollY; // Prendre en compte le défilement vertical
    moveVertically(); // Appeler la fonction de mouvement vertical
    checkAndJump(e.clientX + window.scrollX); // Vérifie s'il doit sauter vers un mur ou le bord d'une section
});
