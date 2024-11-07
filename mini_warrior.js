const character = document.getElementById("character");
const characterSize = 30; // Taille du personnage (assumée ici comme un carré de 30x30px)
let targetY; // La position cible en Y
const speed = 2; // Vitesse constante pour les mouvements
let isMoving = false; // Flag pour contrôler le mouvement continu

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
                closestRight = sectionLeft;
            }
        }
    });

    // Déterminer si la balle doit se déplacer vers le mur le plus proche
    const distanceToCursor = Math.abs(cursorX - characterX);
    const distanceToLeftWall = Math.abs(closestLeft - cursorX);
    const distanceToRightWall = Math.abs(closestRight - cursorX);

    if (distanceToLeftWall < distanceToCursor && distanceToLeftWall < distanceToRightWall) {
        character.style.left = `${closestLeft}px`; // Déplacer vers le mur gauche
        console.log("La balle s'est déplacée vers le mur le plus proche à gauche:", closestLeft);
    } else if (distanceToRightWall < distanceToCursor && distanceToRightWall < distanceToLeftWall) {
        character.style.left = `${closestRight}px`; // Déplacer vers le mur droit
        console.log("La balle s'est déplacée vers le mur le plus proche à droite:", closestRight);
    }
}

// Suivre la position verticale du curseur sur l'axe Y uniquement
window.addEventListener("mousemove", (e) => {
    targetY = e.clientY + window.scrollY; // Prendre en compte le défilement vertical
    moveVertically(); // Appeler la fonction de mouvement vertical
    findClosestWalls(e.clientX + window.scrollX); // Vérifie et déplace la balle si nécessaire
});
