/* ==========================================================================
   THREE.JS ANTI-GRAVITY 3D SCENES
   ========================================================================== */

(function () {
    // Check WebGL availability
    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!isWebGLAvailable()) {
        console.warn('WebGL not supported in this browser. Falling back to CSS effects.');
        return;
    }

    // Mouse coordinates globally shared
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener('mousemove', (e) => {
        // Normalized between -1 and 1
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Lerp helper
    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    /* ----------------------------------------------------------------------
       1. GLOBAL BACKGROUND SCENE (Floating Particles & Drift Geometries)
       ---------------------------------------------------------------------- */
    const initBackgroundScene = () => {
        const canvas = document.getElementById('three-bg-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();

        // Add subtle fog for depth
        scene.fog = new THREE.FogExp2(0x060609, 0.015);

        // Camera
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 20;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        // Colorful point lights that float in zero gravity
        const pointLight1 = new THREE.PointLight(0x8b5cf6, 2, 50); // Violet
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 50); // Cyan
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);

        // Cursor-following point light for local illumination
        const cursorLight = new THREE.PointLight(0x06b6d4, 4, 30);
        scene.add(cursorLight);

        // Parent group to handle mouse/scroll parallax
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        /* --- Create Floating Particle Field (Zero-Gravity Dust) --- */
        const particleCount = 250;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const randomSpeeds = [];

        for (let i = 0; i < particleCount; i++) {
            // Distribute widely
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;

            randomSpeeds.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.01
            });
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Soft circular particle texture via HTML canvas
        const createParticleTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 16, 16);
            return new THREE.CanvasTexture(canvas);
        };

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.15,
            map: createParticleTexture(),
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: 0xa78bfa
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        mainGroup.add(particles);

        /* --- Create Glassy Floating Geometric Meshes --- */
        const meshes = [];
        const geometries = [
            new THREE.OctahedronGeometry(1.2, 0),
            new THREE.TorusGeometry(0.8, 0.25, 8, 24),
            new THREE.IcosahedronGeometry(1.0, 0),
            new THREE.TetrahedronGeometry(1.1, 0),
            new THREE.DodecahedronGeometry(0.9, 0)
        ];

        // Premium physical iridescent glass material
        const meshMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x0f0b24,
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.1,
            roughness: 0.05,
            metalness: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            transmission: 0.5, // Semi-translucent glass
            ior: 1.5,
            thickness: 1.0,
            flatShading: true,
            transparent: true,
            opacity: 0.6,
            iridescence: 1.0,
            iridescenceIOR: 1.8,
            iridescenceThicknessRange: [100, 400],
            side: THREE.DoubleSide
        });

        // Wireframe material for the outer shell
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });

        // Spawn shapes at random points in outer layers of space
        for (let i = 0; i < 8; i++) {
            const geom = geometries[i % geometries.length];
            const meshGroup = new THREE.Group();

            const solidMesh = new THREE.Mesh(geom, meshMaterial);
            const wireMesh = new THREE.Mesh(geom, wireframeMaterial);

            // Slightly scale wireframe to avoid z-fighting
            wireMesh.scale.setScalar(1.05);

            meshGroup.add(solidMesh);
            meshGroup.add(wireMesh);

            // Random position layout
            meshGroup.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 15 - 5
            );

            // Random scale
            const sc = 0.5 + Math.random() * 0.8;
            meshGroup.scale.set(sc, sc, sc);

            mainGroup.add(meshGroup);

            meshes.push({
                group: meshGroup,
                rotationSpeedX: (Math.random() - 0.5) * 0.006,
                rotationSpeedY: (Math.random() - 0.5) * 0.006,
                rotationSpeedZ: (Math.random() - 0.5) * 0.006,
                driftSpeed: 0.2 + Math.random() * 0.5,
                driftOffset: Math.random() * 100,
                baseY: meshGroup.position.y
            });
        }

        // Handle Resize
        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize);

        // Render Loop Variables
        let scrollY = 0;
        let targetScrollY = 0;

        window.addEventListener('scroll', () => {
            targetScrollY = window.scrollY;
        });

        const clock = new THREE.Clock();

        const animate = () => {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Smoothly Lerp mouse variables
            mouse.x = lerp(mouse.x, mouse.x + (mouse.targetX - mouse.x) * 0.05, 1);
            mouse.y = lerp(mouse.y, mouse.y + (mouse.targetY - mouse.y) * 0.05, 1);

            // Smoothly Lerp scroll
            scrollY = lerp(scrollY, targetScrollY, 0.05);

            // Parallax movement of the entire background
            mainGroup.rotation.y = mouse.x * 0.08;
            mainGroup.rotation.x = -mouse.y * 0.08;

            // Drift shapes vertically based on scroll (Anti-gravity effect)
            mainGroup.position.y = (scrollY * 0.008);

            // Update floating shapes
            meshes.forEach((m) => {
                m.group.rotation.x += m.rotationSpeedX;
                m.group.rotation.y += m.rotationSpeedY;
                m.group.rotation.z += m.rotationSpeedZ;

                // Subtle zero-g drift up and down
                m.group.position.y = m.baseY + Math.sin(elapsedTime * m.driftSpeed + m.driftOffset) * 0.6;
            });

            // Gentle drift of dust particles
            const positionsArray = particleGeometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                // Drift particles slowly
                positionsArray[i * 3] += randomSpeeds[i].x;
                positionsArray[i * 3 + 1] += randomSpeeds[i].y + (targetScrollY - scrollY) * 0.0001; // respond to scroll velocity
                positionsArray[i * 3 + 2] += randomSpeeds[i].z;

                // Wrap boundaries
                if (Math.abs(positionsArray[i * 3]) > 25) positionsArray[i * 3] *= -0.99;
                if (Math.abs(positionsArray[i * 3 + 1]) > 25) positionsArray[i * 3 + 1] *= -0.99;
                if (Math.abs(positionsArray[i * 3 + 2]) > 25) positionsArray[i * 3 + 2] *= -0.99;
            }
            particleGeometry.attributes.position.needsUpdate = true;

            // Float PointLights slightly
            pointLight1.position.x = 10 + Math.sin(elapsedTime * 0.5) * 5;
            pointLight1.position.y = 10 + Math.cos(elapsedTime * 0.3) * 5;
            pointLight2.position.x = -10 + Math.cos(elapsedTime * 0.4) * 5;
            pointLight2.position.y = -10 + Math.sin(elapsedTime * 0.6) * 5;

            // Project cursor light into 3D world space coordinates
            const targetLightX = mouse.x * 18;
            const targetLightY = mouse.y * 12;
            cursorLight.position.x = lerp(cursorLight.position.x, targetLightX, 0.08);
            cursorLight.position.y = lerp(cursorLight.position.y, targetLightY, 0.08);
            cursorLight.position.z = 8; // Float slightly in front of floating meshes

            renderer.render(scene, camera);
        };

        animate();
    };

    /* ----------------------------------------------------------------------
       2. HERO INTERACTIVE CRYSTAL ORB SCENE
       ---------------------------------------------------------------------- */
    const initHeroScene = () => {
        const container = document.getElementById('hero-canvas-container');
        const canvas = document.getElementById('hero-3d-canvas');
        if (!canvas || !container) return;

        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
        camera.position.z = 5.2;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
        scene.add(ambientLight);

        // Bright highlights to show off physical materials
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(5, 5, 5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.2); // Cyan glow
        fillLight.position.set(-5, 3, 2);
        scene.add(fillLight);

        const backlight = new THREE.DirectionalLight(0x8b5cf6, 1.8); // Purple glow
        backlight.position.set(0, -5, -2);
        scene.add(backlight);

        // Create main floating crystal structure
        const crystalGroup = new THREE.Group();
        scene.add(crystalGroup);

        // Geometry: Faceted Icosahedron
        const coreGeo = new THREE.IcosahedronGeometry(1.3, 0);

        // Materials: Glassy outer shape and glowing inner wireframe
        const physicalMat = new THREE.MeshPhysicalMaterial({
            color: 0x0b061e, // Extra deep obsidian/indigo
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.25,
            roughness: 0.05,
            metalness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            transmission: 0.85, // Glass transparency
            ior: 1.8, // High glass refractive index
            thickness: 2.0,
            iridescence: 1.0, // High holographic rainbow reflection
            iridescenceIOR: 1.9,
            iridescenceThicknessRange: [100, 400],
            flatShading: true,
            side: THREE.DoubleSide
        });

        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0x06b6d4, // Neon Cyan
            wireframe: true,
            transparent: true,
            opacity: 0.45
        });

        const solidCrystal = new THREE.Mesh(coreGeo, physicalMat);
        const wireCrystal = new THREE.Mesh(coreGeo, wireframeMat);

        // Scale wireframe slightly larger
        wireCrystal.scale.setScalar(1.025);

        crystalGroup.add(solidCrystal);
        crystalGroup.add(wireCrystal);

        // Add Orbiting high-tech planetary-gimbal rings
        const ringGeo1 = new THREE.TorusGeometry(1.9, 0.02, 8, 64);
        const ringMat1 = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.3
        });
        const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        ring1.rotation.x = Math.PI / 3;
        crystalGroup.add(ring1);

        const ringGeo2 = new THREE.TorusGeometry(2.2, 0.015, 8, 64);
        const ringMat2 = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.25
        });
        const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        ring2.rotation.x = -Math.PI / 4;
        ring2.rotation.y = Math.PI / 6;
        crystalGroup.add(ring2);

        // Interaction Variables
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotationVelocity = { x: 0.003, y: 0.005 };
        let isHovered = false;

        // Mouse Drag Interaction
        const onPointerDown = (e) => {
            isDragging = true;
            previousMousePosition = {
                x: e.clientX || e.touches[0].clientX,
                y: e.clientY || e.touches[0].clientY
            };
        };

        const onPointerMove = (e) => {
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            if (isDragging && clientX !== undefined) {
                const deltaX = clientX - previousMousePosition.x;
                const deltaY = clientY - previousMousePosition.y;

                crystalGroup.rotation.y += deltaX * 0.007;
                crystalGroup.rotation.x += deltaY * 0.007;

                rotationVelocity = {
                    x: deltaY * 0.0015,
                    y: deltaX * 0.0015
                };

                previousMousePosition = { x: clientX, y: clientY };
            }
        };

        const onPointerUp = () => {
            isDragging = false;
        };

        // Attach listeners directly to canvas container
        container.addEventListener('mousedown', onPointerDown);
        container.addEventListener('touchstart', onPointerDown, { passive: true });

        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove, { passive: true });

        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        // Hover Effect
        container.addEventListener('mouseenter', () => { isHovered = true; });
        container.addEventListener('mouseleave', () => { isHovered = false; });

        // Resize Helper
        const onResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        // Resize observer for container
        const resizeObserver = new ResizeObserver(() => onResize());
        resizeObserver.observe(container);

        const clock = new THREE.Clock();

        // Render Loop
        const animate = () => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            if (!isDragging) {
                // Decay velocity slowly back to default
                rotationVelocity.x = lerp(rotationVelocity.x, 0.002, 0.05);
                rotationVelocity.y = lerp(rotationVelocity.y, 0.003, 0.05);

                crystalGroup.rotation.x += rotationVelocity.x;
                crystalGroup.rotation.y += rotationVelocity.y;
            }

            // Interactive Hover Float and Expand
            const targetScale = isHovered ? 1.15 : 1.0;
            crystalGroup.scale.x = lerp(crystalGroup.scale.x, targetScale, 0.08);
            crystalGroup.scale.y = lerp(crystalGroup.scale.y, targetScale, 0.08);
            crystalGroup.scale.z = lerp(crystalGroup.scale.z, targetScale, 0.08);

            // Fast spin pulse on hover
            if (isHovered && !isDragging) {
                crystalGroup.rotation.y += 0.008;
            }

            // Zero-gravity floating bounce
            crystalGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

            // Rotate orbiting gimbal rings independently
            ring1.rotation.z += 0.003;
            ring2.rotation.z -= 0.005;

            // React to global mouse position subtly
            if (!isDragging) {
                crystalGroup.position.x = lerp(crystalGroup.position.x, mouse.x * 0.2, 0.05);
                crystalGroup.position.y += mouse.y * 0.05; // additive float
            }

            renderer.render(scene, camera);
        };

        animate();
    };

    // Initialize both scenes on page load
    window.addEventListener('DOMContentLoaded', () => {
        initBackgroundScene();
        initHeroScene();
    });
})();
