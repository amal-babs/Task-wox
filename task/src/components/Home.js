"use client";
import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cubesData } from "./cubesData";
import styles from "@/app/styles/LandingPage.module.scss";
import Image from "next/image";

const Home = () => {
    const stickyRef = useRef(null);
    const logoRef = useRef(null);
    const cubesContainerRef = useRef(null);
    const header1Ref = useRef(null);
    const header2Ref = useRef(null);
    const cubeRefs = useRef([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            //  Register ScrollTrigger
            gsap.registerPlugin(ScrollTrigger);

            //  Correctly Initialize Lenis
            const lenis = new Lenis();
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            //  Link Lenis with GSAP ScrollTrigger
            lenis.on("scroll", ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);

            //  Select Elements
            const stickySection = stickyRef.current;
            const logo = logoRef.current;
            const cubesContainer = cubesContainerRef.current;
            const header1 = header1Ref.current;
            const header2 = header2Ref.current;

            const stickyHeight = window.innerHeight * 4;

            const interpolate = (start, end, progress) => {
                return start + (end - start) * progress;
            };

            ScrollTrigger.create({
                trigger: stickySection,
                start: "top top",
                end: `+=${stickyHeight}px`,
                scrub: 1,
                pin: true,
                pinSpacing: true,
                onUpdate: (self) => {
                    const initialProgress = Math.min(self.progress * 20, 1);
                    logo.style.filter = `blur(${interpolate(0, 20, initialProgress)}px)`;

                    const logoOpacityProgress =
                        self.progress >= 0.02 ? Math.min((self.progress - 0.02) * 100, 1) : 0;
                    logo.style.opacity = 1 - logoOpacityProgress;

                    const cubesOpacityProgress =
                        self.progress > 0.01 ? Math.min((self.progress - 0.01) * 100, 1) : 0;
                    cubesContainer.style.opacity = cubesOpacityProgress;

                    const header1Progress = Math.min(self.progress * 2.5, 1);
                    header1.style.transform = `translate(-50%, -50%) scale(${interpolate(
                        1,
                        1.5,
                        header1Progress
                    )})`;
                    header1.style.filter = `blur(${interpolate(0, 20, header1Progress)}px)`;
                    header1.style.opacity = 1 - header1Progress;

                    const header2StartProgress = (self.progress - 0.4) * 10;
                    const header2Progress = Math.max(0, Math.min(header2StartProgress, 1));
                    const header2Scale = interpolate(0.75, 1, header2Progress);
                    const header2Blur = interpolate(10, 0, header2Progress);

                    header2.style.transform = `translate(-50%, -50%) scale(${header2Scale})`;
                    header2.style.filter = `blur(${header2Blur}px)`;
                    header2.style.opacity = header2Progress;

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
        }
    }, []);
    const getFaceClass = (faceIndex) => {
        const faceMap = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        return faceMap[faceIndex]; 
    };

    return (
        <div className={styles.main}>
            <section className={styles.sticky} ref={stickyRef}>
                <div className={styles.logo} ref={logoRef}>
                    <div className={styles.col}>
                        <div className={`${styles.block} ${styles.block1}`}></div>
                        <div className={`${styles.block} ${styles.block2}`}></div>
                    </div>
                    <div className={styles.col}>
                        <div className={`${styles.block} ${styles.block3}`}></div>
                        <div className={`${styles.block} ${styles.block4}`}></div>
                    </div>
                    <div className={styles.col}>
                        <div className={`${styles.block} ${styles.block5}`}></div>
                        <div className={`${styles.block} ${styles.block6}`}></div>
                    </div>
                </div>

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
                                    
                                    <div key={faceIndex} className={styles[getFaceClass(faceIndex)]}>
                                        <Image className={styles.i}
                                            src={`/images/cube${cubeNumber}img${faceIndex + 1}.jpg`}
                                            alt={`Cube ${cubeNumber} Face ${faceIndex + 1}`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 150px"
                                            quality={75}
                                            priority={index < 3} // Only load first 3 images eagerly
                                            loading={index < 3 ? "eager" : "lazy"}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>


                <div className={styles.heading} ref={header1Ref}>
                    <h1>The First Media Company crafted For the digital First generation</h1>
                </div>

                <div className={styles.subheading} ref={header2Ref}>
                    <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>Where innovation meets precision </h2>
                    <p>
                        Symphonia unites visionary thinkers, creative architects, and analytical
                        experts, collaborating seamlessly to transform challenges into
                        opportunities. Together, we deliver tailored solutions that drive impact and
                        inspire growth.
                    </p>
                </div>
            </section>

            <section className={styles.about}>
                <h2>Your next section goes here</h2>
            </section>
        </div>
    );
};

export default Home;
