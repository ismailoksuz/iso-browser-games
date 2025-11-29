const gameList = document.getElementById('game-list');
const gameCards = document.querySelectorAll('.game-card');
const heroBackground = document.getElementById('hero-background');
const focusedTitle = document.getElementById('focused-title');
const focusedSubtitle = document.getElementById('focused-subtitle');
const listWrapper = document.getElementById('game-list-wrapper');

let activeIndex = 0;
let isDragging = false;
let startX = 0;
let scrollLeftWhenStart = 0;

function updateMenu() {
    gameCards.forEach((card, index) => {
        card.classList.remove('active');
        if (index === activeIndex) {
            card.classList.add('active');
            heroBackground.style.backgroundImage = `url('${card.querySelector("img").src}')`;
            focusedTitle.textContent = card.dataset.title;
            focusedSubtitle.textContent = card.dataset.subtitle;
        }
    });

    const activeCard = gameCards[activeIndex];
    if (activeCard) {
        const cardWidth = activeCard.offsetWidth;
        const offsetLeft = activeCard.offsetLeft;
        const wrapperWidth = listWrapper.offsetWidth;
        const centerOffset = (wrapperWidth / 2) - (cardWidth / 2) - 30;
        const transformX = offsetLeft - centerOffset;
        gameList.style.transform = `translateX(${-transformX}px)`;
    }
}

function startDrag(e) {
    isDragging = true;
    startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const style = window.getComputedStyle(gameList).transform;
    scrollLeftWhenStart = style === 'none' ? 0 : new DOMMatrix(style).m41;
    gameList.style.transition = 'none';
    listWrapper.style.cursor = 'grabbing';
}

function duringDrag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const walk = (x - startX) * 1.8;
    gameList.style.transform = `translateX(${scrollLeftWhenStart + walk}px)`;
}

function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    gameList.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    listWrapper.style.cursor = 'grab';

    const endX = e.type.includes('mouse') ? e.pageX : e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) > 60) {
        if (deltaX > 0 && activeIndex > 0) activeIndex--;
        else if (deltaX < 0 && activeIndex < gameCards.length - 1) activeIndex++;
    }
    updateMenu();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (activeIndex < gameCards.length - 1) { activeIndex++; updateMenu(); }
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (activeIndex > 0) { activeIndex--; updateMenu(); }
    } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = gameCards[activeIndex].href;
    }
});

gameCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        if (index === activeIndex) {
            window.location.href = card.href;
        } else {
            activeIndex = index;
            updateMenu();
        }
    });
});

listWrapper.addEventListener('touchstart', startDrag, { passive: true });
listWrapper.addEventListener('touchmove', duringDrag, { passive: false });
listWrapper.addEventListener('touchend', endDrag);

listWrapper.addEventListener('mousedown', startDrag);
listWrapper.addEventListener('mousemove', duringDrag);
listWrapper.addEventListener('mouseup', endDrag);
listWrapper.addEventListener('mouseleave', endDrag);

listWrapper.style.cursor = 'grab';
listWrapper.style.userSelect = 'none';

window.addEventListener('resize', updateMenu);
updateMenu();