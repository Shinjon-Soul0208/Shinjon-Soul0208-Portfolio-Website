// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. SETUP CANVAS & SCENE
    // -------------------------------------------------------------
    const canvas = document.querySelector('#three-bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 2.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // -------------------------------------------------------------
    // 2. CREATING THE PARTICLE FIELD ("ZERO-GRAVITY")
    // -------------------------------------------------------------
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1400; // Large density of stars

    const points = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        points[i] = (Math.random() - 0.5) * 6; // Spread particles in a 3D box
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3));

    // Material with glowing characteristics
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true
    });

    // Mesh
    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleMesh);

    // -------------------------------------------------------------
    // 3. MOUSE INTERACTION & DRIFT
    // -------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onMouseMove = (event) => {
        // Normalize mouse coordinates (-1 to 1)
        mouseX = (event.clientX - windowHalfX) / windowHalfX;
        mouseY = (event.clientY - windowHalfY) / windowHalfY;
    };

    window.addEventListener('mousemove', onMouseMove);

    // -------------------------------------------------------------
    // 4. ANIMATING SCENE (Drift + Rotation)
    // -------------------------------------------------------------
    const clock = new THREE.Clock();

    // Render loop
    const animate = () => {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Rotate particles slowly
        particleMesh.rotation.y = elapsedTime * 0.03;
        particleMesh.rotation.x = elapsedTime * 0.01;

        // Smoothly interpolate camera position based on mouse drift
        targetX = mouseX * 0.4;
        targetY = -mouseY * 0.4;

        // Lerp camera
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;

        renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // 5. RESIZE LISTENER
    // -------------------------------------------------------------
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
});
