import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createApple } from '../../game/models';

export const MenuBackground: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setClearColor(0xffffff, 1);
        currentMount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const apples: { mesh: THREE.Group; velocity: THREE.Vector3; rotation: THREE.Euler; }[] = [];
        const appleCount = 30;
        const spawnArea = { x: 40, y: 30, z: 20 };

        for (let i = 0; i < appleCount; i++) {
            const mesh = createApple();
            mesh.position.set(
                (Math.random() - 0.5) * spawnArea.x,
                (Math.random() - 0.5) * spawnArea.y,
                (Math.random() - 0.5) * spawnArea.z - 10
            );
            mesh.scale.setScalar(Math.random() * 0.5 + 0.8);
            scene.add(mesh);
            apples.push({
                mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 1 + 0.5, // Tend to float upwards
                    (Math.random() - 0.5) * 0.1
                ),
                rotation: new THREE.Euler(
                    Math.random() * 0.01,
                    Math.random() * 0.01,
                    Math.random() * 0.01
                ),
            });
        }

        const handleResize = () => {
            if (!currentMount) return;
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            apples.forEach(apple => {
                apple.mesh.position.add(apple.velocity.clone().multiplyScalar(0.05));
                apple.mesh.rotation.x += apple.rotation.x;
                apple.mesh.rotation.y += apple.rotation.y;
                apple.mesh.rotation.z += apple.rotation.z;

                if (apple.mesh.position.y > spawnArea.y / 2) {
                    apple.mesh.position.y = -spawnArea.y / 2;
                    apple.mesh.position.x = (Math.random() - 0.5) * spawnArea.x;
                }
                 if (apple.mesh.position.x > spawnArea.x / 2) {
                    apple.mesh.position.x = -spawnArea.x / 2;
                } else if (apple.mesh.position.x < -spawnArea.x / 2) {
                    apple.mesh.position.x = spawnArea.x / 2;
                }
            });

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            scene.traverse(o => {
                if (o instanceof THREE.Mesh) {
                    o.geometry.dispose();
                    if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
                    else o.material.dispose();
                }
            });
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0" />;
};