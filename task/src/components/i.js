"use client";
import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cubesData } from "./cubesData";
import styles from "@/app/styles/LandingPage.module.scss";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const stickyRef = useRef(null);
    const logoRef = useRef(null);
    const cubesContainerRef = useRef(null);
    const header1Ref = useRef(null);
    const header2Ref = useRef(null);
    const cubeRefs = useRef([]);

    const interpolate = (start, end, progress) => {
        return start + (end - start) * progress;
    };

    useEffect(() => {
        const lenis = new Lenis();
        
        lenis.on("scroll", ScrollTrigger.update);
        
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        
        gsap.ticker.lagSmoothing(0);

        const stickyHeight = window.innerHeight * 4;

        ScrollTrigger.create({
            trigger: stickyRef.current,
            start: "top top",
            end: `+=${stickyHeight}px`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            onUpdate: (self) => {
                // Logo effects
                const initialProgress = Math.min(self.progress * 20, 1);
                logoRef.current.style.filter = `blur(${interpolate(0, 20, initialProgress)}px)`;
                
                const logoOpacityProgress = self.progress >= 0.02 
                    ? Math.min((self.progress - 0.02) * 100, 1) 
                    : 0;
                logoRef.current.style.opacity = 1 - logoOpacityProgress;

                // Cubes container opacity
                const cubesOpacityProgress = self.progress > 0.01 
                    ? Math.min((self.progress - 0.01) * 100, 1) 
                    : 0;
                cubesContainerRef.current.style.opacity = cubesOpacityProgress;

                // Header 1 effects
                const header1Progress = Math.min(self.progress * 2.5, 1);
                header1Ref.current.style.transform = `translate(-50%, -50%) scale(${interpolate(1, 1.5, header1Progress)})`;
                header1Ref.current.style.filter = `blur(${interpolate(0, 20, header1Progress)}px)`;
                header1Ref.current.style.opacity = 1 - header1Progress;

                // Header 2 effects
                const header2StartProgress = (self.progress - 0.4) * 10;
                const header2Progress = Math.max(0, Math.min(header2StartProgress, 1));
                const header2Scale = interpolate(0.75, 1, header2Progress);
                const header2Blur = interpolate(10, 0, header2Progress);
                header2Ref.current.style.transform = `translate(-50%, -50%) scale(${header2Scale})`;
                header2Ref.current.style.filter = `blur(${header2Blur}px)`;
                header2Ref.current.style.opacity = header2Progress;

                // Cube animations
                const firstPhaseProgress = Math.min(self.progress * 2, 1);
                const secondPhaseProgress = self.progress >= 0.5 ? (self.progress - 0.5) * 2 : 0;

                Object.entries(cubesData).forEach(([cubeClass, data], index) => {
                    const cube = cubeRefs.current[index];
                    if (!cube) return;

                    const { initial, final } = data;
                    const currentTop = interpolate(initial.top, final.top, firstPhaseProgress);
                    const currentLeft = interpolate(initial.left, final.left, firstPhaseProgress);
                    const currentRotateX = interpolate(initial.rotateX, final.rotateX, firstPhaseProgress);
                    const currentRotateY = interpolate(initial.rotateY, final.rotateY, firstPhaseProgress);
                    const currentRotateZ = interpolate(initial.rotateZ, final.rotateZ, firstPhaseProgress);
                    const currentZ = interpolate(initial.z, final.z, firstPhaseProgress);

                    let additionalRotation = 0;
                    if (cubeClass === "cube2") {
                        additionalRotation = interpolate(0, 180, secondPhaseProgress);
                    } else if (cubeClass === "cube4") {
                        additionalRotation = interpolate(0, -180, secondPhaseProgress);
                    }

                    cube.style.top = `${currentTop}%`;
                    cube.style.left = `${currentLeft}%`;
                    cube.style.transform = `
                        translate3d(-50%, -50%, ${currentZ}px)
                        rotateX(${currentRotateX}deg)
                        rotateY(${currentRotateY + additionalRotation}deg)
                        rotateZ(${currentRotateZ}deg)
                    `;
                });
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            lenis.destroy();
        };
    }, []);

    return (
        <div className={styles.main}>
            <section className={styles.sticky} ref={stickyRef}>
                {/* Logo blocks remain same */}

                <div className={styles.cubes} ref={cubesContainerRef}>
                    {[...Array(6)].map((_, index) => {
                        const cubeNumber = index + 1;
                        return (
                            <div 
                                key={index}
                                ref={el => cubeRefs.current[index] = el}
                                className={`${styles.cube} ${styles[`cube${cubeNumber}`]}`}
                            >
                                {[...Array(6)].map((_, faceIndex) => (
                                    <div key={faceIndex} className={styles[`face${faceIndex + 1}`]}>
                                        <img 
                                            src={`/images/cube${cubeNumber}img${faceIndex + 1}.jpg`} 
                                            alt={`Cube ${cubeNumber} Face ${faceIndex + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Headers remain same */}
            </section>

            <section className={styles.about}>
                <h2>Your next section goes here</h2>
            </section>
        </div>
    );
};

export default Home;