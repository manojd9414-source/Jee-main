import { useState, useEffect, useCallback } from "react";

// ── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  phy: { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca", badge: "#818cf8" },
  che: { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", badge: "#fb923c" },
  mat: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", badge: "#4ade80" },
  org: { bg: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", badge: "#c084fc" },
  ino: { bg: "#fff1f2", border: "#fecdd3", text: "#be123c", badge: "#fb7185" },
};

// ── TEST PLANNER DATA (2025 → 2026) ─────────────────────────────────────────
const TESTS = [
  { id:1,  date:"Sunday, May 11, 2026",    name:"Short Test-1",    type:"Part Test", pattern:"Short Test",
    physics:"Mathematical Tools (Complete)",
    chemistry:"Some Basic Concepts of Chemistry: Nature of Matter, Classification, SI Units, Uncertainty, Laws of Chemical Combinations, Dalton's Atomic Theory, Atomic Mass, Molecular Mass, Percentage Composition, Mole Concept",
    maths:"Basic Mathematics: Number system, Wavy Curve Method" },
  { id:2,  date:"Sunday, May 25, 2026",    name:"JEE Main-1",      type:"Part Test", pattern:"JEE Main",
    physics:"Mathematical Tools (Complete) | Motion in a Straight Line (Complete)",
    chemistry:"Some Basic Concepts of Chemistry (Complete) | Redox Reaction (Complete) | Solutions: Binary Solution, Concentration Terms, Solubility, Vapour Pressure",
    maths:"Basic Mathematics (Complete)" },
  { id:3,  date:"Sunday, June 8, 2026",    name:"JEE Main-2",      type:"Part Test", pattern:"JEE Main",
    physics:"Motion in a Plane (Complete) | Relative Motion (Complete) | Laws of Motion (Complete)",
    chemistry:"Solutions (Complete) | Chemical Kinetics: Introduction, Rate of Reaction, Integrated Rate Equations, Collision Theory, Activation Energy",
    maths:"Quadratic Equations (Complete) | Sequence and Series (Complete)" },
  { id:4,  date:"Sunday, June 22, 2026",   name:"JEE Advanced-1",  type:"Part Test", pattern:"JEE Advanced",
    physics:"Mathematical Tools | Motion in Straight Line | Motion in Plane | Relative Motion | Laws of Motion | Work, Energy & Power | Circular Motion (All Complete)",
    chemistry:"Some Basic Concepts | Redox | Solutions | Chemical Kinetics | Thermodynamics (All Complete)",
    maths:"Basic Mathematics | Quadratic Equations | Sequence & Series | Trigonometric Functions | Trigonometric Equation (All Complete)" },
  { id:5,  date:"Sunday, July 6, 2026",    name:"JEE Main-3",      type:"Part Test", pattern:"JEE Main",
    physics:"Centre of Mass & System of Particles (Complete) | Rotational Motion: Definition, MOI, Parallel & Perpendicular Axis Theorem",
    chemistry:"Chemical Equilibrium (Complete) | Ionic Equilibrium (Complete) | Electrochemistry: Galvanic Cells, Nernst Equation, Faraday's Laws, Molar Conductivity",
    maths:"Permutations and Combinations (Complete)" },
  { id:6,  date:"Sunday, July 20, 2026",   name:"JEE Main-4",      type:"Part Test", pattern:"JEE Main",
    physics:"Rotational Motion (Complete)",
    chemistry:"Electrochemistry (Complete) | Structure of Atom (Complete)",
    maths:"Binomial Theorem (Complete) | Straight Lines (Complete)" },
  { id:7,  date:"Sunday, August 3, 2026",  name:"JEE Advanced-2",  type:"Part Test", pattern:"JEE Advanced",
    physics:"Centre of Mass | Rotational Motion | Oscillations (All Complete)",
    chemistry:"Chemical Equilibrium | Ionic Equilibrium | Electrochemistry | Structure of Atom | Classification of Elements & Periodicity (All Complete)",
    maths:"Permutations & Combinations | Binomial Theorem | Straight Lines | Circles | Conic Sections: Parabola (All Complete)" },
  { id:8,  date:"Sunday, August 17, 2026", name:"JEE Main-5",      type:"Part Test", pattern:"JEE Main",
    physics:"Ray Optics and Optical Instruments (Complete) | Dual Nature (Complete)",
    chemistry:"Chemical Bonding and Molecular Structure (Complete)",
    maths:"Conic Sections: Ellipse (Complete) | Conic Sections: Hyperbola (Complete)" },
  { id:9,  date:"Sunday, August 31, 2026", name:"JEE Main-6",      type:"Part Test", pattern:"JEE Main",
    physics:"Atoms (Complete) | Nuclei (Complete)",
    chemistry:"Some Basic Principles & Techniques: IUPAC Nomenclature (Complete)",
    maths:"Determinants (Complete)" },
  { id:10, date:"Sunday, September 14, 2026", name:"JEE Advanced-3", type:"Part Test", pattern:"JEE Advanced",
    physics:"Ray Optics | Dual Nature | Atoms | Nuclei | Thermal Properties | Kinetic Theory (All Complete)",
    chemistry:"Chemical Bonding | IUPAC Nomenclature | General Organic Chemistry (All Complete)",
    maths:"Ellipse | Hyperbola | Determinants | Matrices | Sets (All Complete)" },
  { id:11, date:"Sunday, September 28, 2026", name:"JEE Main-7",   type:"Part Test", pattern:"JEE Main",
    physics:"Thermodynamics (Complete) | Mechanical Properties of Solids (Complete) | Mechanical Properties of Fluids (Complete)",
    chemistry:"Some Basic Principles: Isomerism (Complete)",
    maths:"Relations and Functions (Complete) | Inverse Trigonometric Functions (Complete)" },
  { id:12, date:"Sunday, October 12, 2026", name:"JEE Main-8",     type:"Part Test", pattern:"JEE Main",
    physics:"Electric Charges and Fields & Potential (Complete)",
    chemistry:"Hydrocarbon (Complete) | Haloalkanes and Haloarenes: Optical Isomerism",
    maths:"Limit, Continuity and Differentiability (Complete) | Method of Differentiation (Complete)" },
  { id:13, date:"Sunday, October 26, 2026", name:"JEE Advanced-4", type:"Part Test", pattern:"JEE Advanced",
    physics:"Thermodynamics | Mechanical Properties Solids & Fluids | Electric Charges & Potential | Gravitation (All Complete)",
    chemistry:"Isomerism | Hydrocarbon | Haloalkanes | Alcohols, Phenols & Ethers (All Complete)",
    maths:"Relations & Functions | ITF | LCD | Method of Differentiation (All Complete)" },
  { id:14, date:"Sunday, November 9, 2026", name:"JEE Main-9",     type:"Part Test", pattern:"JEE Main",
    physics:"Current Electricity (Complete)",
    chemistry:"Aldehydes, Ketones & Carboxylic Acids: Nomenclature, Preparation, Nucleophilic Addition, ALDOL, Cannizzaro, Wittig, Carboxylic Acids",
    maths:"Application of Derivatives (Complete) | Indefinite Integration (Complete)" },
  { id:15, date:"Sunday, November 23, 2026", name:"JEE Main-10",   type:"Part Test", pattern:"JEE Main",
    physics:"Electrostatic Potential and Capacitance (Complete) | Moving Charges and Magnetism (Complete)",
    chemistry:"Aldehydes, Ketones & Carboxylic Acids (Complete) | Amines (Complete) | Biomolecules (Complete) | Purification & Analysis (Complete) | Coordination Compounds: Shape, Ligand Classification",
    maths:"Definite Integration (Complete) | Application of Integrals (Complete)" },
  { id:16, date:"Sunday, December 7, 2026", name:"JEE Advanced-5", type:"Part Test", pattern:"JEE Advanced",
    physics:"Current Electricity | Electrostatic Potential | Moving Charges | Magnetism & Matter | EM Induction (All Complete)",
    chemistry:"Aldehydes & Ketones | Amines | Biomolecules | Purification | Coordination Compounds (All Complete)",
    maths:"Application of Derivatives | Indefinite Integration | Definite Integration | Application of Integrals | Differential Equation | Vector Algebra (All Complete)" },
  { id:17, date:"Sunday, December 21, 2026", name:"JEE Main-11",   type:"Part Test", pattern:"JEE Main",
    physics:"Alternating Current (Complete) | Waves (Complete) | Electromagnetic Waves (Complete)",
    chemistry:"Salt Analysis (Complete) | P-block Elements (Complete) | d & f Block Elements (Complete)",
    maths:"3D Geometry (Complete) | Complex Number (Complete)" },
  { id:18, date:"Sunday, January 4, 2026",  name:"JEE Main-12",    type:"Full Test", pattern:"JEE Main",   physics:"Full Syllabus", chemistry:"Full Syllabus", maths:"Full Syllabus" },
  { id:19, date:"Sunday, January 18, 2026", name:"JEE Main-13",    type:"Full Test", pattern:"JEE Main",   physics:"Full Syllabus", chemistry:"Full Syllabus", maths:"Full Syllabus" },
  { id:20, date:"Sunday, February 1, 2026", name:"JEE Main-14",    type:"Full Test", pattern:"JEE Main",   physics:"Full Syllabus", chemistry:"Full Syllabus", maths:"Full Syllabus" },
  { id:21, date:"Sunday, February 22, 2026",name:"JEE Main-15",    type:"Full Test", pattern:"JEE Main",   physics:"Full Syllabus", chemistry:"Full Syllabus", maths:"Full Syllabus" },
  { id:22, date:"Sunday, March 8, 2026",    name:"JEE Advanced-7", type:"Full Test", pattern:"JEE Advanced",physics:"Full Syllabus", chemistry:"Full Syllabus", maths:"Full Syllabus" },
  { id:23, date:"Sunday, March 22, 2026",   name:"JEE Main-16",    type:"Full Test", pattern:"JEE Main",   physics:"Full Syllabus", chemistry:"Full Syllabus", maths:"Full Syllabus" },
  { id:24, date:"Sunday, April 19, 2026",   name:"JEE Advanced-8", type:"Full Test", pattern:"JEE Advanced",physics:"Full Syllabus", chemistry:"Full Syllabus", maths:"Full Syllabus" },
  { id:25, date:"Sunday, May 3, 2026",      name:"JEE Advanced-9", type:"Full Test", pattern:"JEE Advanced",physics:"Full Syllabus", chemistry:"Full Syllabus", maths:"Full Syllabus" },
  { id:26, date:"Sunday, May 17, 2026",     name:"JEE Advanced-10",type:"Full Test", pattern:"JEE Advanced",physics:"Full Syllabus", chemistry:"Full Syllabus", maths:"Full Syllabus" },
];

// ── PHYSICS LECTURES (2025→2026) ────────────────────────────────────────────
const PHYSICS_LECS = [
  { n:1,  ch:"Mathematical Tools",               topic:"Basic Maths",                            date:"Mon, Apr 21, 2026", fac:"Manish Singh Tak Sir" },
  { n:2,  ch:"Mathematical Tools",               topic:"Basic Maths",                            date:"Tue, Apr 22, 2026", fac:"Manish Singh Tak Sir" },
  { n:3,  ch:"Mathematical Tools",               topic:"Scalars and Vectors",                    date:"Wed, Apr 23, 2026", fac:"Manish Singh Tak Sir" },
  { n:4,  ch:"Mathematical Tools",               topic:"Subtraction / Resolution of Vectors",    date:"Thu, Apr 24, 2026", fac:"Manish Singh Tak Sir" },
  { n:5,  ch:"Mathematical Tools",               topic:"Subtraction / Resolution of Vectors",    date:"Fri, Apr 25, 2026", fac:"Manish Singh Tak Sir" },
  { n:6,  ch:"Mathematical Tools",               topic:"Dimensions",                             date:"Sat, Apr 26, 2026", fac:"Manish Singh Tak Sir" },
  { n:7,  ch:"Motion in a Straight Line",        topic:"Introduction",                           date:"Mon, Apr 28, 2026", fac:"Manish Singh Tak Sir" },
  { n:8,  ch:"Motion in a Straight Line",        topic:"Position, Path Length, Displacement",    date:"Tue, Apr 29, 2026", fac:"Manish Singh Tak Sir" },
  { n:9,  ch:"Motion in a Straight Line",        topic:"Speed",                                  date:"Wed, Apr 30, 2026", fac:"Manish Singh Tak Sir" },
  { n:10, ch:"Motion in a Straight Line",        topic:"Velocity",                               date:"Fri, May 2, 2026",  fac:"Manish Singh Tak Sir" },
  { n:11, ch:"Motion in a Straight Line",        topic:"Acceleration",                           date:"Sat, May 3, 2026",  fac:"Manish Singh Tak Sir" },
  { n:12, ch:"Motion in a Straight Line",        topic:"Graphs",                                 date:"Mon, May 5, 2026",  fac:"Manish Singh Tak Sir" },
  { n:13, ch:"Motion in a Straight Line",        topic:"Uniformly Accelerated Motion",           date:"Tue, May 6, 2026",  fac:"Manish Singh Tak Sir" },
  { n:14, ch:"Motion in a Plane",                topic:"Introduction",                           date:"Wed, May 7, 2026",  fac:"Manish Singh Tak Sir" },
  { n:15, ch:"Motion in a Plane",                topic:"Motion in a Plane",                      date:"Thu, May 8, 2026",  fac:"Manish Singh Tak Sir" },
  { n:16, ch:"Motion in a Plane",                topic:"Projectile Motion",                      date:"Fri, May 9, 2026",  fac:"Manish Singh Tak Sir" },
  { n:17, ch:"Relative Motion",                  topic:"Relative Velocity / Circular Motion",    date:"Sat, May 10, 2026", fac:"Manish Singh Tak Sir" },
  { n:18, ch:"Relative Motion",                  topic:"Relative Velocity / Circular Motion",    date:"Mon, May 12, 2026", fac:"Manish Singh Tak Sir" },
  { n:19, ch:"Relative Motion",                  topic:"Relative Velocity / Circular Motion",    date:"Tue, May 13, 2026", fac:"Manish Singh Tak Sir" },
  { n:20, ch:"Laws of Motion",                   topic:"Newton's Laws of Motion",                date:"Wed, May 14, 2026", fac:"Manish Singh Tak Sir" },
  { n:21, ch:"Laws of Motion",                   topic:"Newton's Laws of Motion",                date:"Thu, May 15, 2026", fac:"Manish Singh Tak Sir" },
  { n:22, ch:"Laws of Motion",                   topic:"Spring",                                 date:"Fri, May 16, 2026", fac:"Manish Singh Tak Sir" },
  { n:23, ch:"Laws of Motion",                   topic:"Pseudo Force",                           date:"Sat, May 17, 2026", fac:"Manish Singh Tak Sir" },
  { n:24, ch:"Laws of Motion",                   topic:"Friction",                               date:"Mon, May 19, 2026", fac:"Manish Singh Tak Sir" },
  { n:25, ch:"Laws of Motion",                   topic:"Friction",                               date:"Tue, May 20, 2026", fac:"Manish Singh Tak Sir" },
  { n:26, ch:"Laws of Motion",                   topic:"Friction",                               date:"Wed, May 21, 2026", fac:"Manish Singh Tak Sir" },
  { n:27, ch:"Laws of Motion",                   topic:"Friction",                               date:"Thu, May 22, 2026", fac:"Manish Singh Tak Sir" },
  { n:28, ch:"Laws of Motion",                   topic:"Friction",                               date:"Fri, May 23, 2026", fac:"Manish Singh Tak Sir" },
  { n:29, ch:"Work, Energy and Power",           topic:"Introduction of Work",                   date:"Sat, May 24, 2026", fac:"Manish Singh Tak Sir" },
  { n:30, ch:"Work, Energy and Power",           topic:"Work by Constant & Variable Force",      date:"Mon, May 26, 2026", fac:"Manish Singh Tak Sir" },
  { n:31, ch:"Work, Energy and Power",           topic:"Graphical Interpretation",               date:"Tue, May 27, 2026", fac:"Manish Singh Tak Sir" },
  { n:32, ch:"Work, Energy and Power",           topic:"KE, Conservative / Non-conservative Force", date:"Wed, May 28, 2026", fac:"Manish Singh Tak Sir" },
  { n:33, ch:"Work, Energy and Power",           topic:"Potential Energy / Work-KE Theorem",     date:"Thu, May 29, 2026", fac:"Manish Singh Tak Sir" },
  { n:34, ch:"Work, Energy and Power",           topic:"Types of Equilibrium",                   date:"Fri, May 30, 2026", fac:"Manish Singh Tak Sir" },
  { n:35, ch:"Work, Energy and Power",           topic:"Stable Equilibrium",                     date:"Sat, May 31, 2026", fac:"Manish Singh Tak Sir" },
  { n:36, ch:"Work, Energy and Power",           topic:"Unstable Equilibrium",                   date:"Mon, Jun 2, 2026",  fac:"Manish Singh Tak Sir" },
  { n:37, ch:"Work, Energy and Power",           topic:"Neutral Equilibrium / Power",            date:"Tue, Jun 3, 2026",  fac:"Manish Singh Tak Sir" },
  { n:38, ch:"Circular Motion",                  topic:"Circular Motion",                        date:"Wed, Jun 4, 2026",  fac:"Manish Singh Tak Sir" },
  { n:39, ch:"Circular Motion",                  topic:"Circular Motion",                        date:"Thu, Jun 5, 2026",  fac:"Manish Singh Tak Sir" },
  { n:40, ch:"Circular Motion",                  topic:"Circular Motion",                        date:"Sat, Jun 7, 2026",  fac:"Manish Singh Tak Sir" },
  { n:41, ch:"Circular Motion",                  topic:"Circular Motion",                        date:"Mon, Jun 9, 2026",  fac:"Manish Singh Tak Sir" },
  { n:42, ch:"Circular Motion",                  topic:"Circular Motion",                        date:"Tue, Jun 10, 2026", fac:"Manish Singh Tak Sir" },
  { n:43, ch:"Centre of Mass",                   topic:"Introduction and Definition",            date:"Wed, Jun 11, 2026", fac:"Manish Singh Tak Sir" },
  { n:44, ch:"Centre of Mass",                   topic:"COM of Discrete & Continuous Systems",  date:"Thu, Jun 12, 2026", fac:"Manish Singh Tak Sir" },
  { n:45, ch:"Centre of Mass",                   topic:"Additive System, Shifting, Velocity of COM", date:"Fri, Jun 13, 2026", fac:"Manish Singh Tak Sir" },
  { n:46, ch:"Centre of Mass",                   topic:"Conservation of Linear Momentum",        date:"Sat, Jun 14, 2026", fac:"Manish Singh Tak Sir" },
  { n:47, ch:"Centre of Mass",                   topic:"Jumping from cart, Recoil of Gun",       date:"Mon, Jun 16, 2026", fac:"Manish Singh Tak Sir" },
  { n:48, ch:"Centre of Mass",                   topic:"C-Frame",                                date:"Tue, Jun 17, 2026", fac:"Manish Singh Tak Sir" },
  { n:49, ch:"Centre of Mass",                   topic:"Introduction and Definition",            date:"Wed, Jun 18, 2026", fac:"Manish Singh Tak Sir" },
  { n:50, ch:"Centre of Mass",                   topic:"Coefficient of Restitution",             date:"Thu, Jun 19, 2026", fac:"Manish Singh Tak Sir" },
  { n:51, ch:"Centre of Mass",                   topic:"Concept of Impulse",                     date:"Fri, Jun 20, 2026", fac:"Manish Singh Tak Sir" },
  { n:52, ch:"Centre of Mass",                   topic:"Impulsive and Non-impulsive Forces",     date:"Sat, Jun 21, 2026", fac:"Manish Singh Tak Sir" },
  { n:53, ch:"Rotational Motion",                topic:"Definition of Rigid Body",               date:"Mon, Jun 23, 2026", fac:"Manish Singh Tak Sir" },
  { n:54, ch:"Rotational Motion",                topic:"MOI of Single Particle",                 date:"Tue, Jun 24, 2026", fac:"Manish Singh Tak Sir" },
  { n:55, ch:"Rotational Motion",                topic:"MOI of System of Particles",             date:"Wed, Jun 25, 2026", fac:"Manish Singh Tak Sir" },
  { n:56, ch:"Rotational Motion",                topic:"MOI of Rigid Bodies",                    date:"Thu, Jun 26, 2026", fac:"Manish Singh Tak Sir" },
  { n:57, ch:"Rotational Motion",                topic:"Parallel & Perpendicular Axis Theorem",  date:"Fri, Jun 27, 2026", fac:"Manish Singh Tak Sir" },
  { n:58, ch:"Rotational Motion",                topic:"Radius of Gyration / Compound Objects",  date:"Sat, Jun 28, 2026", fac:"Manish Singh Tak Sir" },
  { n:59, ch:"Rotational Motion",                topic:"Torque / Rotational Equilibrium",        date:"Mon, Jun 30, 2026", fac:"Manish Singh Tak Sir" },
  { n:60, ch:"Rotational Motion",                topic:"KE of Rigid Body Rotating about Fixed Axis", date:"Tue, Jul 1, 2026", fac:"Manish Singh Tak Sir" },
  { n:61, ch:"Rotational Motion",                topic:"Rotation about Fixed Axis",              date:"Wed, Jul 2, 2026",  fac:"Manish Singh Tak Sir" },
  { n:62, ch:"Rotational Motion",                topic:"Angular Momentum & Conservation",        date:"Thu, Jul 3, 2026",  fac:"Manish Singh Tak Sir" },
  { n:63, ch:"Rotational Motion",                topic:"Angular Momentum & Conservation",        date:"Fri, Jul 4, 2026",  fac:"Manish Singh Tak Sir" },
  { n:64, ch:"Rotational Motion",                topic:"Rotation about Fixed Axis",              date:"Sat, Jul 5, 2026",  fac:"Manish Singh Tak Sir" },
  { n:65, ch:"Rotational Motion",                topic:"Combined Translational & Rotational",    date:"Mon, Jul 7, 2026",  fac:"Manish Singh Tak Sir" },
  { n:66, ch:"Rotational Motion",                topic:"Combined Translational & Rotational",    date:"Tue, Jul 8, 2026",  fac:"Manish Singh Tak Sir" },
  { n:67, ch:"Rotational Motion",                topic:"Impulsive Force and Impulsive Torque",   date:"Wed, Jul 9, 2026",  fac:"Manish Singh Tak Sir" },
  { n:68, ch:"Oscillations",                     topic:"Linear SHM",                             date:"Thu, Jul 10, 2026", fac:"Manish Singh Tak Sir" },
  { n:69, ch:"Oscillations",                     topic:"Linear SHM",                             date:"Fri, Jul 11, 2026", fac:"Manish Singh Tak Sir" },
  { n:70, ch:"Oscillations",                     topic:"Energy in SHM",                          date:"Sat, Jul 12, 2026", fac:"Manish Singh Tak Sir" },
  { n:71, ch:"Oscillations",                     topic:"Series & Parallel Combination of Springs",date:"Mon, Jul 14, 2026", fac:"Manish Singh Tak Sir" },
  { n:72, ch:"Oscillations",                     topic:"Angular SHM",                            date:"Tue, Jul 15, 2026", fac:"Manish Singh Tak Sir" },
  { n:73, ch:"Oscillations",                     topic:"Special Cases of SHM",                   date:"Wed, Jul 16, 2026", fac:"Manish Singh Tak Sir" },
  { n:74, ch:"Oscillations",                     topic:"Special Cases of SHM",                   date:"Thu, Jul 17, 2026", fac:"Manish Singh Tak Sir" },
  { n:75, ch:"Ray Optics",                       topic:"Plane Mirrors",                          date:"Fri, Jul 18, 2026", fac:"Manish Singh Tak Sir" },
  { n:76, ch:"Ray Optics",                       topic:"Reflection from Curved Surface",         date:"Sat, Jul 19, 2026", fac:"Manish Singh Tak Sir" },
  { n:77, ch:"Ray Optics",                       topic:"Refraction of Light",                    date:"Mon, Jul 21, 2026", fac:"Manish Singh Tak Sir" },
  { n:78, ch:"Ray Optics",                       topic:"Prism",                                  date:"Tue, Jul 22, 2026", fac:"Manish Singh Tak Sir" },
  { n:79, ch:"Ray Optics",                       topic:"TIR",                                    date:"Wed, Jul 23, 2026", fac:"Manish Singh Tak Sir" },
  { n:80, ch:"Ray Optics",                       topic:"Refraction from Spherical Surface",      date:"Thu, Jul 24, 2026", fac:"Manish Singh Tak Sir" },
  { n:81, ch:"Ray Optics",                       topic:"Thin Lens",                              date:"Fri, Jul 25, 2026", fac:"Manish Singh Tak Sir" },
  { n:82, ch:"Ray Optics",                       topic:"Optical Instruments",                    date:"Sat, Jul 26, 2026", fac:"Manish Singh Tak Sir" },
  { n:83, ch:"Ray Optics",                       topic:"Optical Instruments",                    date:"Mon, Jul 28, 2026", fac:"Manish Singh Tak Sir" },
  { n:84, ch:"Ray Optics",                       topic:"Optical Instruments",                    date:"Tue, Jul 29, 2026", fac:"Manish Singh Tak Sir" },
  { n:85, ch:"Ray Optics",                       topic:"Optical Instruments",                    date:"Wed, Jul 30, 2026", fac:"Manish Singh Tak Sir" },
  { n:86, ch:"Ray Optics",                       topic:"Thin Lens",                              date:"Thu, Jul 31, 2026", fac:"Manish Singh Tak Sir" },
  { n:87, ch:"Ray Optics",                       topic:"Thin Lens",                              date:"Fri, Aug 1, 2026",  fac:"Manish Singh Tak Sir" },
  { n:88, ch:"Ray Optics",                       topic:"Thin Lens",                              date:"Sat, Aug 2, 2026",  fac:"Manish Singh Tak Sir" },
  { n:89, ch:"Ray Optics",                       topic:"Thin Lens",                              date:"Mon, Aug 4, 2026",  fac:"Manish Singh Tak Sir" },
  { n:90, ch:"Dual Nature",                      topic:"Dual Nature of Matter and Waves",        date:"Tue, Aug 5, 2026",  fac:"Manish Singh Tak Sir" },
  { n:91, ch:"Dual Nature",                      topic:"Photoelectric Effect",                   date:"Wed, Aug 6, 2026",  fac:"Manish Singh Tak Sir" },
  { n:92, ch:"Dual Nature",                      topic:"Quantum Theory of Light",                date:"Thu, Aug 7, 2026",  fac:"Manish Singh Tak Sir" },
  { n:93, ch:"Atoms",                            topic:"Atomic Models",                          date:"Sat, Aug 9, 2026",  fac:"Manish Singh Tak Sir" },
  { n:94, ch:"Atoms",                            topic:"Bohr's Model",                           date:"Mon, Aug 11, 2026", fac:"Manish Singh Tak Sir" },
  { n:95, ch:"Atoms",                            topic:"Atomic Spectrum / Hydrogen Spectra / X-Rays", date:"Tue, Aug 12, 2026", fac:"Manish Singh Tak Sir" },
  { n:96, ch:"Nuclei",                           topic:"Introduction to Nucleus",                date:"Wed, Aug 13, 2026", fac:"Manish Singh Tak Sir" },
  { n:97, ch:"Nuclei",                           topic:"Radioactive Decay / Parallel & Series",  date:"Thu, Aug 14, 2026", fac:"Manish Singh Tak Sir" },
  { n:98, ch:"Nuclei",                           topic:"Radioactive Decay",                      date:"Sat, Aug 16, 2026", fac:"Manish Singh Tak Sir" },
  { n:99, ch:"Thermal Properties",               topic:"Thermal Expansion",                      date:"Mon, Aug 18, 2026", fac:"Manish Singh Tak Sir" },
  { n:100,ch:"Thermal Properties",               topic:"Calorimetry",                            date:"Tue, Aug 19, 2026", fac:"Manish Singh Tak Sir" },
  { n:101,ch:"Thermal Properties",               topic:"Calorimetry",                            date:"Wed, Aug 20, 2026", fac:"Manish Singh Tak Sir" },
  { n:102,ch:"Thermal Properties",               topic:"Conduction",                             date:"Thu, Aug 21, 2026", fac:"Manish Singh Tak Sir" },
  { n:103,ch:"Thermal Properties",               topic:"Conduction",                             date:"Fri, Aug 22, 2026", fac:"Manish Singh Tak Sir" },
  { n:104,ch:"Thermal Properties",               topic:"Conduction",                             date:"Sat, Aug 23, 2026", fac:"Manish Singh Tak Sir" },
  { n:105,ch:"Thermal Properties",               topic:"Radiation",                              date:"Mon, Aug 25, 2026", fac:"Manish Singh Tak Sir" },
  { n:106,ch:"Thermal Properties",               topic:"Radiation",                              date:"Tue, Aug 26, 2026", fac:"Manish Singh Tak Sir" },
  { n:107,ch:"Kinetic Theory",                   topic:"Gas Laws",                               date:"Thu, Aug 28, 2026", fac:"Manish Singh Tak Sir" },
  { n:108,ch:"Kinetic Theory",                   topic:"Pressure and Kinetic Energy",            date:"Fri, Aug 29, 2026", fac:"Manish Singh Tak Sir" },
  { n:109,ch:"Kinetic Theory",                   topic:"Pressure and Kinetic Energy",            date:"Sat, Aug 30, 2026", fac:"Manish Singh Tak Sir" },
  { n:110,ch:"Thermodynamics (Phy)",             topic:"Thermodynamics",                         date:"Mon, Sep 1, 2026",  fac:"Manish Singh Tak Sir" },
  { n:111,ch:"Thermodynamics (Phy)",             topic:"Gas Laws",                               date:"Tue, Sep 2, 2026",  fac:"Manish Singh Tak Sir" },
  { n:112,ch:"Thermodynamics (Phy)",             topic:"Pressure and Kinetic Energy",            date:"Wed, Sep 3, 2026",  fac:"Manish Singh Tak Sir" },
  { n:113,ch:"Thermodynamics (Phy)",             topic:"Pressure and Kinetic Energy",            date:"Thu, Sep 4, 2026",  fac:"Manish Singh Tak Sir" },
  { n:114,ch:"Thermodynamics (Phy)",             topic:"Different Processes in Ideal Gas",       date:"Fri, Sep 5, 2026",  fac:"Manish Singh Tak Sir" },
  { n:115,ch:"Thermodynamics (Phy)",             topic:"Thermodynamic System, Heat, Reversible & Irreversible", date:"Sat, Sep 6, 2026", fac:"Manish Singh Tak Sir" },
  { n:116,ch:"Thermodynamics (Phy)",             topic:"1st & 2nd Law of Thermodynamics",        date:"Mon, Sep 8, 2026",  fac:"Manish Singh Tak Sir" },
  { n:117,ch:"Mechanical Properties of Solids",  topic:"Elasticity & Energy (Recorded)",         date:"Mon, Sep 8, 2026",  fac:"Manish Singh Tak Sir" },
  { n:118,ch:"Mechanical Properties of Solids",  topic:"Elasticity & Energy (Recorded)",         date:"Tue, Sep 9, 2026",  fac:"Manish Singh Tak Sir" },
  { n:119,ch:"Mechanical Properties of Fluids",  topic:"Fluid Statics",                          date:"Tue, Sep 9, 2026",  fac:"Manish Singh Tak Sir" },
  { n:120,ch:"Mechanical Properties of Fluids",  topic:"Fluid Statics",                          date:"Wed, Sep 10, 2026", fac:"Manish Singh Tak Sir" },
  { n:121,ch:"Mechanical Properties of Fluids",  topic:"Fluid Statics",                          date:"Thu, Sep 11, 2026", fac:"Manish Singh Tak Sir" },
  { n:122,ch:"Mechanical Properties of Fluids",  topic:"Fluid Dynamics",                         date:"Fri, Sep 12, 2026", fac:"Manish Singh Tak Sir" },
  { n:123,ch:"Mechanical Properties of Fluids",  topic:"Fluid Dynamics",                         date:"Sat, Sep 13, 2026", fac:"Manish Singh Tak Sir" },
  { n:124,ch:"Mechanical Properties of Fluids",  topic:"Surface Tension",                        date:"Mon, Sep 15, 2026", fac:"Manish Singh Tak Sir" },
  { n:125,ch:"Mechanical Properties of Fluids",  topic:"Surface Tension",                        date:"Tue, Sep 16, 2026", fac:"Manish Singh Tak Sir" },
  { n:126,ch:"Mechanical Properties of Fluids",  topic:"Viscosity",                              date:"Wed, Sep 17, 2026", fac:"Manish Singh Tak Sir" },
  { n:127,ch:"Electric Charges & Fields",        topic:"Introduction, Charge",                   date:"Thu, Sep 18, 2026", fac:"Manish Singh Tak Sir" },
  { n:128,ch:"Electric Charges & Fields",        topic:"Coulomb's Law",                          date:"Fri, Sep 19, 2026", fac:"Manish Singh Tak Sir" },
  { n:129,ch:"Electric Charges & Fields",        topic:"Electric Field, Conductors & Insulators",date:"Sat, Sep 20, 2026", fac:"Manish Singh Tak Sir" },
  { n:130,ch:"Electric Charges & Fields",        topic:"Electric Field of Continuous Charge Distribution", date:"Mon, Sep 22, 2026", fac:"Manish Singh Tak Sir" },
  { n:131,ch:"Electric Charges & Fields",        topic:"Electric Field of Continuous Charge Distribution", date:"Tue, Sep 23, 2026", fac:"Manish Singh Tak Sir" },
  { n:132,ch:"Electric Charges & Fields",        topic:"Motion of Charged Particle in E-Field",  date:"Wed, Sep 24, 2026", fac:"Manish Singh Tak Sir" },
  { n:133,ch:"Electric Charges & Fields",        topic:"Motion of Charged Particle in E-Field",  date:"Thu, Sep 25, 2026", fac:"Manish Singh Tak Sir" },
  { n:134,ch:"Electric Charges & Fields",        topic:"Electric Flux, Gauss Law",               date:"Fri, Sep 26, 2026", fac:"Manish Singh Tak Sir" },
  { n:135,ch:"Electric Charges & Fields",        topic:"Electrostatic Potential, E vs V Relation",date:"Sat, Sep 27, 2026", fac:"Manish Singh Tak Sir" },
  { n:136,ch:"Electric Charges & Fields",        topic:"Equipotential Surface",                  date:"Mon, Sep 29, 2026", fac:"Manish Singh Tak Sir" },
  { n:137,ch:"Electric Charges & Fields",        topic:"Electrostatic PE, Potential due to Dipole",date:"Tue, Sep 30, 2026", fac:"Manish Singh Tak Sir" },
  { n:138,ch:"Electric Charges & Fields",        topic:"Electrostatics of Conductor",            date:"Wed, Oct 1, 2026",  fac:"Manish Singh Tak Sir" },
  { n:139,ch:"Electric Charges & Fields",        topic:"Conductor & its Capacitance",            date:"Fri, Oct 3, 2026",  fac:"Manish Singh Tak Sir" },
  { n:140,ch:"Electric Charges & Fields",        topic:"Charging of a Capacitor",                date:"Sat, Oct 4, 2026",  fac:"Manish Singh Tak Sir" },
  { n:141,ch:"Electric Charges & Fields",        topic:"Combination of Capacitors",              date:"Mon, Oct 6, 2026",  fac:"Manish Singh Tak Sir" },
  { n:142,ch:"Gravitation",                      topic:"Newton's Law of Gravitation",            date:"Tue, Oct 7, 2026",  fac:"Manish Singh Tak Sir" },
  { n:143,ch:"Gravitation",                      topic:"Kepler's Law",                           date:"Wed, Oct 8, 2026",  fac:"Manish Singh Tak Sir" },
  { n:144,ch:"Current Electricity",              topic:"Electric Current",                       date:"Thu, Oct 9, 2026",  fac:"Manish Singh Tak Sir" },
  { n:145,ch:"Current Electricity",              topic:"Current in Conductors",                  date:"Fri, Oct 10, 2026", fac:"Manish Singh Tak Sir" },
  { n:146,ch:"Current Electricity",              topic:"Kirchhoff's Laws / Combination of Resistances", date:"Sat, Oct 11, 2026", fac:"Manish Singh Tak Sir" },
  { n:147,ch:"Current Electricity",              topic:"Wheatstone Bridge / Symmetric Circuits", date:"Mon, Oct 13, 2026", fac:"Manish Singh Tak Sir" },
  { n:148,ch:"Current Electricity",              topic:"Heating Effect / Cells & Combination",   date:"Tue, Oct 14, 2026", fac:"Manish Singh Tak Sir" },
  { n:149,ch:"Current Electricity",              topic:"Electrical Measuring Instruments / RC Circuit", date:"Wed, Oct 15, 2026", fac:"Manish Singh Tak Sir" },
  { n:150,ch:"Current Electricity",              topic:"Electrical Measuring Instruments / RC Circuit", date:"Thu, Oct 16, 2026", fac:"Manish Singh Tak Sir" },
  { n:151,ch:"Current Electricity",              topic:"Electrical Measuring Instruments / RC Circuit", date:"Fri, Oct 17, 2026", fac:"Manish Singh Tak Sir" },
  { n:152,ch:"Electrostatic Potential & Capacitance", topic:"Dielectric Insertion in Capacitor", date:"Fri, Oct 24, 2026", fac:"Manish Singh Tak Sir" },
  { n:153,ch:"Electrostatic Potential & Capacitance", topic:"Dielectric Insertion in Capacitor", date:"Sat, Oct 25, 2026", fac:"Manish Singh Tak Sir" },
  { n:154,ch:"Electrostatic Potential & Capacitance", topic:"Dielectric Insertion in Capacitor", date:"Wed, Oct 29, 2026", fac:"Manish Singh Tak Sir" },
  { n:155,ch:"Electrostatic Potential & Capacitance", topic:"Dielectric Insertion in Capacitor", date:"Thu, Oct 30, 2026", fac:"Manish Singh Tak Sir" },
  { n:156,ch:"Electrostatic Potential & Capacitance", topic:"Dielectric Insertion in Capacitor", date:"Fri, Oct 31, 2026", fac:"Manish Singh Tak Sir" },
  { n:157,ch:"Electrostatic Potential & Capacitance", topic:"Dielectric Insertion in Capacitor", date:"Sat, Nov 1, 2026",  fac:"Manish Singh Tak Sir" },
  { n:158,ch:"Electrostatic Potential & Capacitance", topic:"Dielectric Insertion in Capacitor", date:"Mon, Nov 3, 2026",  fac:"Manish Singh Tak Sir" },
  { n:159,ch:"Moving Charges and Magnetism",     topic:"Oersted's Experiment / Biot-Savart's Law",date:"Tue, Nov 4, 2026", fac:"Manish Singh Tak Sir" },
  { n:160,ch:"Moving Charges and Magnetism",     topic:"B-field due to Ring / Combination",      date:"Wed, Nov 5, 2026",  fac:"Manish Singh Tak Sir" },
  { n:161,ch:"Moving Charges and Magnetism",     topic:"Ampere's Law and Applications",          date:"Thu, Nov 6, 2026",  fac:"Manish Singh Tak Sir" },
  { n:162,ch:"Moving Charges and Magnetism",     topic:"Force on Moving Charge in B-field",      date:"Fri, Nov 7, 2026",  fac:"Manish Singh Tak Sir" },
  { n:163,ch:"Moving Charges and Magnetism",     topic:"Lorentz Force / Motion in E & B",        date:"Sat, Nov 8, 2026",  fac:"Manish Singh Tak Sir" },
  { n:164,ch:"Moving Charges and Magnetism",     topic:"Magnetic Force on Current Carrying Conductor", date:"Mon, Nov 10, 2026", fac:"Manish Singh Tak Sir" },
  { n:165,ch:"Moving Charges and Magnetism",     topic:"Gyromagnetic Ratio / Torque on Loop",    date:"Tue, Nov 11, 2026", fac:"Manish Singh Tak Sir" },
  { n:166,ch:"Moving Charges and Magnetism",     topic:"Magnetic Dipole",                        date:"Wed, Nov 12, 2026", fac:"Manish Singh Tak Sir" },
  { n:167,ch:"Moving Charges and Magnetism",     topic:"Magnetic Dipole",                        date:"Thu, Nov 13, 2026", fac:"Manish Singh Tak Sir" },
  { n:168,ch:"Moving Charges and Magnetism",     topic:"Magnetic Dipole",                        date:"Fri, Nov 14, 2026", fac:"Manish Singh Tak Sir" },
  { n:169,ch:"Moving Charges and Magnetism",     topic:"Magnetic Dipole",                        date:"Sat, Nov 15, 2026", fac:"Manish Singh Tak Sir" },
  { n:170,ch:"Magnetism and Matter",             topic:"Bar Magnet / Oscillation Magnetometer / Classification / Ferromagnetism", date:"Mon, Nov 17, 2026", fac:"Manish Singh Tak Sir" },
  { n:171,ch:"Magnetism and Matter",             topic:"Bar Magnet / Classification / Ferromagnetism", date:"Tue, Nov 18, 2026", fac:"Manish Singh Tak Sir" },
  { n:172,ch:"Electromagnetic Induction",        topic:"Magnetic Flux and Lenz's Law",           date:"Wed, Nov 19, 2026", fac:"Manish Singh Tak Sir" },
  { n:173,ch:"Electromagnetic Induction",        topic:"Faraday's Law",                          date:"Thu, Nov 20, 2026", fac:"Manish Singh Tak Sir" },
  { n:174,ch:"Electromagnetic Induction",        topic:"Calculation of Induced EMF",             date:"Fri, Nov 21, 2026", fac:"Manish Singh Tak Sir" },
  { n:175,ch:"Electromagnetic Induction",        topic:"Self Inductance",                        date:"Sat, Nov 22, 2026", fac:"Manish Singh Tak Sir" },
  { n:176,ch:"Electromagnetic Induction",        topic:"Mutual Inductance",                      date:"Mon, Nov 24, 2026", fac:"Manish Singh Tak Sir" },
  { n:177,ch:"Electromagnetic Induction",        topic:"Inductor in Circuits / Induced E-field", date:"Tue, Nov 25, 2026", fac:"Manish Singh Tak Sir" },
  { n:178,ch:"Electromagnetic Induction",        topic:"Inductor in Circuits / Induced E-field", date:"Wed, Nov 26, 2026", fac:"Manish Singh Tak Sir" },
  { n:179,ch:"Electromagnetic Induction",        topic:"Inductor in Circuits / Induced E-field", date:"Thu, Nov 27, 2026", fac:"Manish Singh Tak Sir" },
  { n:180,ch:"Alternating Current",              topic:"Introduction to AC",                     date:"Fri, Nov 28, 2026", fac:"Manish Singh Tak Sir" },
  { n:181,ch:"Alternating Current",              topic:"Average and RMS Values",                 date:"Sat, Nov 29, 2026", fac:"Manish Singh Tak Sir" },
  { n:182,ch:"Alternating Current",              topic:"Types of AC Circuits, Power Factor",     date:"Mon, Dec 1, 2026",  fac:"Manish Singh Tak Sir" },
  { n:183,ch:"Waves",                            topic:"Travelling Waves",                       date:"Tue, Dec 2, 2026",  fac:"Manish Singh Tak Sir" },
  { n:184,ch:"Waves",                            topic:"Wave Function",                          date:"Wed, Dec 3, 2026",  fac:"Manish Singh Tak Sir" },
  { n:185,ch:"Waves",                            topic:"Superposition and Interference",         date:"Thu, Dec 4, 2026",  fac:"Manish Singh Tak Sir" },
  { n:186,ch:"Waves",                            topic:"Superposition & Reflection",             date:"Fri, Dec 5, 2026",  fac:"Manish Singh Tak Sir" },
  { n:187,ch:"Waves",                            topic:"Standing Waves",                         date:"Sat, Dec 6, 2026",  fac:"Manish Singh Tak Sir" },
  { n:188,ch:"Waves",                            topic:"Doppler Effect",                         date:"Mon, Dec 8, 2026",  fac:"Manish Singh Tak Sir" },
  { n:189,ch:"Waves",                            topic:"Huygens' Wave Theory",                   date:"Tue, Dec 9, 2026",  fac:"Manish Singh Tak Sir" },
  { n:190,ch:"Electromagnetic Waves",            topic:"Characteristics of EM Waves",            date:"Wed, Dec 10, 2026", fac:"Manish Singh Tak Sir" },
  { n:191,ch:"Electromagnetic Waves",            topic:"Characteristics of EM Waves",            date:"Thu, Dec 11, 2026", fac:"Manish Singh Tak Sir" },
  { n:192,ch:"Electromagnetic Waves",            topic:"Characteristics of EM Waves",            date:"Fri, Dec 12, 2026", fac:"Manish Singh Tak Sir" },
  { n:193,ch:"Wave Optics",                      topic:"Huygens' Wave Theory",                   date:"Sat, Dec 13, 2026", fac:"Manish Singh Tak Sir" },
  { n:194,ch:"Wave Optics",                      topic:"Interference / YDSE / Fringe Visibility",date:"Mon, Dec 15, 2026", fac:"Manish Singh Tak Sir" },
  { n:195,ch:"Wave Optics",                      topic:"Bichromatic / Fresnel Biprism / Thin Film", date:"Tue, Dec 16, 2026", fac:"Manish Singh Tak Sir" },
  { n:196,ch:"Wave Optics",                      topic:"Diffraction / Polarization / Brewster's Law", date:"Wed, Dec 17, 2026", fac:"Manish Singh Tak Sir" },
  { n:197,ch:"Wave Optics",                      topic:"Scattering and Doppler Effect of Light", date:"Thu, Dec 18, 2026", fac:"Manish Singh Tak Sir" },
  { n:198,ch:"Wave Optics",                      topic:"Scattering and Doppler Effect of Light", date:"Fri, Dec 19, 2026", fac:"Manish Singh Tak Sir" },
  { n:199,ch:"Semiconductor Electronics",        topic:"Intrinsic & Extrinsic Semiconductor",    date:"Sat, Dec 20, 2026", fac:"Manish Singh Tak Sir" },
  { n:200,ch:"Semiconductor Electronics",        topic:"PN Junction Diode",                      date:"Mon, Dec 22, 2026", fac:"Manish Singh Tak Sir" },
  { n:201,ch:"Semiconductor Electronics",        topic:"Application of PN Junction / Transistor / Logic Gate", date:"Tue, Dec 23, 2026", fac:"Manish Singh Tak Sir" },
  { n:202,ch:"Units and Measurements",           topic:"Dimensions",                             date:"Wed, Dec 24, 2026", fac:"Manish Singh Tak Sir" },
  { n:203,ch:"Units and Measurements",           topic:"Error, Significant Figures",             date:"Fri, Dec 26, 2026", fac:"Manish Singh Tak Sir" },
];

// ── PHYSICAL CHEMISTRY LECTURES (abbreviated for space, key lectures) ────────
const PCHEM_LECS = [
  {n:1,ch:"Some Basic Concepts",topic:"Nature of Matter, SI Units, Uncertainty",date:"Mon, Apr 21, 2026",fac:"Faisal Razaq Sir"},
  {n:2,ch:"Some Basic Concepts",topic:"Laws of Chemical Combinations",date:"Tue, Apr 22, 2026",fac:"Faisal Razaq Sir"},
  {n:3,ch:"Some Basic Concepts",topic:"Dalton's Atomic Theory, Atomic Mass",date:"Wed, Apr 23, 2026",fac:"Faisal Razaq Sir"},
  {n:4,ch:"Some Basic Concepts",topic:"Gram Atomic Mass, Average Atomic Mass",date:"Thu, Apr 24, 2026",fac:"Faisal Razaq Sir"},
  {n:5,ch:"Some Basic Concepts",topic:"Molecular Mass, Gram Molecular Mass",date:"Fri, Apr 25, 2026",fac:"Faisal Razaq Sir"},
  {n:6,ch:"Some Basic Concepts",topic:"Average Molecular Mass, Formula Mass",date:"Sat, Apr 26, 2026",fac:"Faisal Razaq Sir"},
  {n:7,ch:"Some Basic Concepts",topic:"Percentage Composition, Empirical & Molecular Formula",date:"Mon, Apr 28, 2026",fac:"Faisal Razaq Sir"},
  {n:8,ch:"Some Basic Concepts",topic:"Mole, Vapour Density, Atomicity",date:"Tue, Apr 29, 2026",fac:"Faisal Razaq Sir"},
  {n:9,ch:"Some Basic Concepts",topic:"Mole Concept",date:"Wed, Apr 30, 2026",fac:"Faisal Razaq Sir"},
  {n:10,ch:"Some Basic Concepts",topic:"Concentration Terms & Application",date:"Fri, May 2, 2026",fac:"Faisal Razaq Sir"},
  {n:11,ch:"Some Basic Concepts",topic:"Concentration Terms & Application",date:"Sat, May 3, 2026",fac:"Faisal Razaq Sir"},
  {n:12,ch:"Some Basic Concepts",topic:"Stoichiometry, Gravimetric Analysis",date:"Mon, May 5, 2026",fac:"Faisal Razaq Sir"},
  {n:13,ch:"Some Basic Concepts",topic:"Sequential Reaction, POAC, Oleum, Eudiometry",date:"Tue, May 6, 2026",fac:"Faisal Razaq Sir"},
  {n:14,ch:"Redox Reaction",topic:"Introduction",date:"Wed, May 7, 2026",fac:"Faisal Razaq Sir"},
  {n:15,ch:"Redox Reaction",topic:"Balancing, Types of Redox, n-Factor",date:"Thu, May 8, 2026",fac:"Faisal Razaq Sir"},
  {n:16,ch:"Redox Reaction",topic:"Law of Equivalence, Redox Titration",date:"Fri, May 9, 2026",fac:"Faisal Razaq Sir"},
  {n:17,ch:"Redox Reaction",topic:"Iodometric & Iodimetric Titration",date:"Sat, May 10, 2026",fac:"Faisal Razaq Sir"},
  {n:18,ch:"Redox Reaction",topic:"Iodometric & Iodimetric Titration",date:"Mon, May 12, 2026",fac:"Faisal Razaq Sir"},
  {n:19,ch:"Solutions",topic:"Binary Solution, Concentration Terms",date:"Tue, May 13, 2026",fac:"Faisal Razaq Sir"},
  {n:20,ch:"Solutions",topic:"Solubility, Vapour Pressure",date:"Wed, May 14, 2026",fac:"Faisal Razaq Sir"},
  {n:21,ch:"Solutions",topic:"Vapour Pressure of Liquid Solutions",date:"Thu, May 15, 2026",fac:"Faisal Razaq Sir"},
  {n:22,ch:"Solutions",topic:"Ideal & Non-ideal Solutions, Colligative Properties",date:"Fri, May 16, 2026",fac:"Faisal Razaq Sir"},
  {n:23,ch:"Solutions",topic:"Osmosis, Osmotic Pressure",date:"Sat, May 17, 2026",fac:"Faisal Razaq Sir"},
  {n:24,ch:"Solutions",topic:"Abnormal Molar Masses",date:"Mon, May 19, 2026",fac:"Faisal Razaq Sir"},
  {n:25,ch:"Solutions",topic:"Van't Hoff Factor",date:"Tue, May 20, 2026",fac:"Faisal Razaq Sir"},
  {n:26,ch:"Solutions",topic:"Abnormal Molar Masses, Van't Hoff Factor",date:"Wed, May 21, 2026",fac:"Faisal Razaq Sir"},
  {n:27,ch:"Chemical Kinetics",topic:"Introduction, Rate of Reaction, Rate Law, Rate Constant, Order",date:"Thu, May 22, 2026",fac:"Faisal Razaq Sir"},
  {n:28,ch:"Chemical Kinetics",topic:"Integrated Rate Equations",date:"Fri, May 23, 2026",fac:"Faisal Razaq Sir"},
  {n:29,ch:"Chemical Kinetics",topic:"Pseudo First Order, Experimental Determination, Collision Theory",date:"Sat, May 24, 2026",fac:"Faisal Razaq Sir"},
  {n:30,ch:"Chemical Kinetics",topic:"Activation Energy, Transition State Theory",date:"Mon, May 26, 2026",fac:"Faisal Razaq Sir"},
  {n:31,ch:"Chemical Kinetics",topic:"Temperature Dependence, Potential Energy Curves",date:"Tue, May 27, 2026",fac:"Faisal Razaq Sir"},
  {n:32,ch:"Chemical Kinetics",topic:"Parallel & Sequential Reactions, Reversible Reaction",date:"Wed, May 28, 2026",fac:"Faisal Razaq Sir"},
  {n:33,ch:"Chemical Kinetics",topic:"Effect of Catalyst, Enzyme Catalysis, Nuclear Chemistry",date:"Thu, May 29, 2026",fac:"Faisal Razaq Sir"},
  {n:34,ch:"Thermodynamics",topic:"Introduction, Basic Terms, State of System",date:"Fri, May 30, 2026",fac:"Faisal Razaq Sir"},
  {n:35,ch:"Thermodynamics",topic:"Types, Processes, Work, Heat, 1st Law, Enthalpy",date:"Sat, May 31, 2026",fac:"Faisal Razaq Sir"},
  {n:36,ch:"Thermodynamics",topic:"Heat Capacity",date:"Mon, Jun 2, 2026",fac:"Faisal Razaq Sir"},
  {n:37,ch:"Thermodynamics",topic:"Calculation of Q, W, ΔU & ΔH",date:"Tue, Jun 3, 2026",fac:"Faisal Razaq Sir"},
  {n:38,ch:"Thermodynamics",topic:"Thermochemistry, Enthalpy of Reaction",date:"Wed, Jun 4, 2026",fac:"Faisal Razaq Sir"},
  {n:39,ch:"Thermodynamics",topic:"Enthalpy Changes, Kirchhoff's Law",date:"Thu, Jun 5, 2026",fac:"Faisal Razaq Sir"},
  {n:40,ch:"Thermodynamics",topic:"Calorimetry, Entropy, 2nd Law",date:"Sat, Jun 7, 2026",fac:"Faisal Razaq Sir"},
  {n:41,ch:"Thermodynamics",topic:"Entropy Change of Solids & Liquids",date:"Mon, Jun 9, 2026",fac:"Faisal Razaq Sir"},
  {n:42,ch:"Thermodynamics",topic:"Standard Entropy, Entropy of Reaction, Gibb's Free Energy",date:"Tue, Jun 10, 2026",fac:"Faisal Razaq Sir"},
  {n:43,ch:"Chemical Equilibrium",topic:"Introduction, Characteristics, Law of Mass Action",date:"Wed, Jun 11, 2026",fac:"Faisal Razaq Sir"},
  {n:44,ch:"Chemical Equilibrium",topic:"Variation of Kc with Stoichiometry",date:"Thu, Jun 12, 2026",fac:"Faisal Razaq Sir"},
  {n:45,ch:"Chemical Equilibrium",topic:"Reaction Quotient, Equilibrium Constant",date:"Fri, Jun 13, 2026",fac:"Faisal Razaq Sir"},
  {n:46,ch:"Chemical Equilibrium",topic:"Degree of Dissociation, Le Chatelier's Principle",date:"Sat, Jun 14, 2026",fac:"Faisal Razaq Sir"},
  {n:47,ch:"Chemical Equilibrium",topic:"Free Energy & Chemical Equilibrium, Physical Equilibrium",date:"Mon, Jun 16, 2026",fac:"Faisal Razaq Sir"},
  {n:48,ch:"Ionic Equilibrium",topic:"Electrolytes, Acid-Base Theory, Autoionization of Water",date:"Tue, Jun 17, 2026",fac:"Faisal Razaq Sir"},
  {n:49,ch:"Ionic Equilibrium",topic:"pH Scale, Ionisation of Weak Electrolyte",date:"Wed, Jun 18, 2026",fac:"Faisal Razaq Sir"},
  {n:50,ch:"Ionic Equilibrium",topic:"Common Ion Effect, Levelling Effect",date:"Thu, Jun 19, 2026",fac:"Faisal Razaq Sir"},
  {n:51,ch:"Ionic Equilibrium",topic:"pH Calculation, Buffer Solution",date:"Fri, Jun 20, 2026",fac:"Faisal Razaq Sir"},
  {n:52,ch:"Ionic Equilibrium",topic:"Salt Hydrolysis, Indicator",date:"Sat, Jun 21, 2026",fac:"Faisal Razaq Sir"},
  {n:53,ch:"Ionic Equilibrium",topic:"Acid-Base Titration, Solubility Product",date:"Mon, Jun 23, 2026",fac:"Faisal Razaq Sir"},
  {n:54,ch:"Electrochemistry",topic:"Introduction, Electrochemical Cell, Galvanic Cells",date:"Tue, Jun 24, 2026",fac:"Faisal Razaq Sir"},
  {n:55,ch:"Electrochemistry",topic:"Electrode Potential, Electrochemical Series",date:"Wed, Jun 25, 2026",fac:"Faisal Razaq Sir"},
  {n:56,ch:"Electrochemistry",topic:"Nernst Equation, Gibbs Energy, Concentration Cell",date:"Thu, Jun 26, 2026",fac:"Faisal Razaq Sir"},
  {n:57,ch:"Electrochemistry",topic:"Electrolytic Cell, Faraday's Laws",date:"Fri, Jun 27, 2026",fac:"Faisal Razaq Sir"},
  {n:58,ch:"Electrochemistry",topic:"Conductance, Molar Conductivity, Equivalent Conductivity",date:"Sat, Jun 28, 2026",fac:"Faisal Razaq Sir"},
  {n:59,ch:"Electrochemistry",topic:"Kohlrausch's Law",date:"Mon, Jun 30, 2026",fac:"Faisal Razaq Sir"},
  {n:60,ch:"Electrochemistry",topic:"Conductometric Titrations, Commercial Cells, Corrosion",date:"Tue, Jul 1, 2026",fac:"Faisal Razaq Sir"},
  {n:61,ch:"Structure of Atom",topic:"Introduction",date:"Wed, Jul 2, 2026",fac:"Faisal Razaq Sir"},
  {n:62,ch:"Structure of Atom",topic:"Fundamental Particles, Discovery",date:"Thu, Jul 3, 2026",fac:"Faisal Razaq Sir"},
  {n:63,ch:"Structure of Atom",topic:"Atomic Models",date:"Fri, Jul 4, 2026",fac:"Faisal Razaq Sir"},
  {n:64,ch:"Structure of Atom",topic:"Nature of Light, Planck's Quantum Theory",date:"Sat, Jul 5, 2026",fac:"Faisal Razaq Sir"},
  {n:65,ch:"Structure of Atom",topic:"Bohr's Model for Hydrogen Atom",date:"Mon, Jul 7, 2026",fac:"Faisal Razaq Sir"},
  {n:66,ch:"Structure of Atom",topic:"Ionization Energy of H and H-Like Particles",date:"Tue, Jul 8, 2026",fac:"Faisal Razaq Sir"},
  {n:67,ch:"Structure of Atom",topic:"Spectrum: Quantized Electronic Energy Levels",date:"Wed, Jul 9, 2026",fac:"Faisal Razaq Sir"},
  {n:68,ch:"Structure of Atom",topic:"Quantum Mechanical Model, Quantum Numbers, Filling Rules",date:"Thu, Jul 10, 2026",fac:"Faisal Razaq Sir"},
  {n:69,ch:"State of Matter (Recorded)",topic:"Gas Laws, Ideal Gas, van der Waals, Liquid State",date:"Sat, Dec 20, 2026",fac:"Faisal Razaq Sir"},
  {n:70,ch:"The Solid State (Recorded)",topic:"Crystal Systems, Cubic Unit Cells, Packing, Defects",date:"Mon, Dec 22, 2026",fac:"Faisal Razaq Sir"},
  {n:71,ch:"Surface Chemistry (Recorded)",topic:"Adsorption, Catalysis, Colloids, Emulsion",date:"Tue, Dec 23, 2026",fac:"Faisal Razaq Sir"},
];

// ── INORGANIC CHEMISTRY LECTURES ───────────────────────────────────────────
const ICHEM_LECS = [
  {n:1,ch:"Classification of Elements & Periodicity",topic:"Need for Classification, Historical Development, Magic Numbers",date:"Fri, Jul 11, 2026",fac:"Amitabh Sharma Sir"},
  {n:2,ch:"Classification of Elements & Periodicity",topic:"Modern Periodic Law, Long Form of Periodic Table",date:"Sat, Jul 12, 2026",fac:"Amitabh Sharma Sir"},
  {n:3,ch:"Classification of Elements & Periodicity",topic:"Electronic Configuration, s/p/d/f Blocks",date:"Mon, Jul 14, 2026",fac:"Amitabh Sharma Sir"},
  {n:4,ch:"Classification of Elements & Periodicity",topic:"s/p/d/f Block Characteristics",date:"Tue, Jul 15, 2026",fac:"Amitabh Sharma Sir"},
  {n:5,ch:"Classification of Elements & Periodicity",topic:"Metals, Non-Metals, Metalloids, Anomalous Properties",date:"Wed, Jul 16, 2026",fac:"Amitabh Sharma Sir"},
  {n:6,ch:"Classification of Elements & Periodicity",topic:"Diagonal Relationship, Bridge Elements, Nomenclature Z>100",date:"Thu, Jul 17, 2026",fac:"Amitabh Sharma Sir"},
  {n:7,ch:"Classification of Elements & Periodicity",topic:"Periodic Properties, Screening Effect, Effective Nuclear Charge",date:"Fri, Jul 18, 2026",fac:"Amitabh Sharma Sir"},
  {n:8,ch:"Classification of Elements & Periodicity",topic:"Periodic Trends in Physical Properties",date:"Sat, Jul 19, 2026",fac:"Amitabh Sharma Sir"},
  {n:9,ch:"Classification of Elements & Periodicity",topic:"Electronegativity Scales, Factors Affecting Electronegativity",date:"Mon, Jul 21, 2026",fac:"Amitabh Sharma Sir"},
  {n:10,ch:"Classification of Elements & Periodicity",topic:"Electronegativity Applications, Hydration Energy, Lattice Energy, MP/BP",date:"Tue, Jul 22, 2026",fac:"Amitabh Sharma Sir"},
  {n:11,ch:"Chemical Bonding",topic:"Introduction, Ionic Bond, Lattice Energy",date:"Wed, Jul 23, 2026",fac:"Amitabh Sharma Sir"},
  {n:12,ch:"Chemical Bonding",topic:"Kössel-Lewis Approach",date:"Thu, Jul 24, 2026",fac:"Amitabh Sharma Sir"},
  {n:13,ch:"Chemical Bonding",topic:"Kössel-Lewis Approach",date:"Fri, Jul 25, 2026",fac:"Amitabh Sharma Sir"},
  {n:14,ch:"Chemical Bonding",topic:"Resonance Energy, VSEPR Theory",date:"Sat, Jul 26, 2026",fac:"Amitabh Sharma Sir"},
  {n:15,ch:"Chemical Bonding",topic:"Valence Bond Theory (VBT)",date:"Mon, Jul 28, 2026",fac:"Amitabh Sharma Sir"},
  {n:16,ch:"Chemical Bonding",topic:"VBT and VSEPR Theory",date:"Tue, Jul 29, 2026",fac:"Amitabh Sharma Sir"},
  {n:17,ch:"Chemical Bonding",topic:"Hybridisation",date:"Wed, Jul 30, 2026",fac:"Amitabh Sharma Sir"},
  {n:18,ch:"Chemical Bonding",topic:"π-π Bonds Determination, Dipole Moment",date:"Thu, Jul 31, 2026",fac:"Amitabh Sharma Sir"},
  {n:19,ch:"Chemical Bonding",topic:"Polarisability, Fajan's Rule, Polarity",date:"Fri, Aug 1, 2026",fac:"Amitabh Sharma Sir"},
  {n:20,ch:"Chemical Bonding",topic:"LCAO",date:"Sat, Aug 2, 2026",fac:"Amitabh Sharma Sir"},
  {n:21,ch:"Chemical Bonding",topic:"Molecular Orbital Theory (MOT)",date:"Mon, Aug 4, 2026",fac:"Amitabh Sharma Sir"},
  {n:22,ch:"Chemical Bonding",topic:"Shapes of Molecular Orbitals",date:"Tue, Aug 5, 2026",fac:"Amitabh Sharma Sir"},
  {n:23,ch:"Chemical Bonding",topic:"Bond Enthalpy, Bond Parameters",date:"Wed, Aug 6, 2026",fac:"Amitabh Sharma Sir"},
  {n:24,ch:"Chemical Bonding",topic:"Hydrogen Bonds, Intermolecular Forces",date:"Thu, Aug 7, 2026",fac:"Amitabh Sharma Sir"},
  {n:25,ch:"Chemical Bonding",topic:"Back Bonding, Bridge Bonding",date:"Sat, Aug 9, 2026",fac:"Amitabh Sharma Sir"},
  {n:26,ch:"Coordination Compounds",topic:"Shape, Double Salt, Complex Compounds",date:"Wed, Nov 12, 2026",fac:"Amitabh Sharma Sir"},
  {n:27,ch:"Coordination Compounds",topic:"Perfect & Imperfect Complex",date:"Thu, Nov 13, 2026",fac:"Amitabh Sharma Sir"},
  {n:28,ch:"Coordination Compounds",topic:"Various Terms in Coordination Compound",date:"Fri, Nov 14, 2026",fac:"Amitabh Sharma Sir"},
  {n:29,ch:"Coordination Compounds",topic:"Classification of Ligand",date:"Sat, Nov 15, 2026",fac:"Amitabh Sharma Sir"},
  {n:30,ch:"Coordination Compounds",topic:"Classification of Ligand",date:"Mon, Nov 17, 2026",fac:"Amitabh Sharma Sir"},
  {n:31,ch:"Coordination Compounds",topic:"Werner Theory",date:"Tue, Nov 18, 2026",fac:"Amitabh Sharma Sir"},
  {n:32,ch:"Coordination Compounds",topic:"Effective Atomic Number",date:"Wed, Nov 19, 2026",fac:"Amitabh Sharma Sir"},
  {n:33,ch:"Coordination Compounds",topic:"Nomenclature, Valence Bond Theory",date:"Thu, Nov 20, 2026",fac:"Amitabh Sharma Sir"},
  {n:34,ch:"Coordination Compounds",topic:"Valence Bond Theory",date:"Fri, Nov 21, 2026",fac:"Amitabh Sharma Sir"},
  {n:35,ch:"Coordination Compounds",topic:"Crystal Field Theory",date:"Sat, Nov 22, 2026",fac:"Amitabh Sharma Sir"},
  {n:36,ch:"Coordination Compounds",topic:"Stability of Complexes",date:"Mon, Nov 24, 2026",fac:"Amitabh Sharma Sir"},
  {n:37,ch:"Coordination Compounds",topic:"Isomerism in Coordination Compounds",date:"Tue, Nov 25, 2026",fac:"Amitabh Sharma Sir"},
  {n:38,ch:"Coordination Compounds",topic:"Organometallic Compounds",date:"Wed, Nov 26, 2026",fac:"Amitabh Sharma Sir"},
  {n:39,ch:"Coordination Compounds",topic:"Application of Coordination Compounds",date:"Thu, Nov 27, 2026",fac:"Amitabh Sharma Sir"},
  {n:40,ch:"Coordination Compounds",topic:"Application of Coordination Compounds",date:"Fri, Nov 28, 2026",fac:"Amitabh Sharma Sir"},
  {n:41,ch:"Salt Analysis",topic:"Introduction",date:"Sat, Nov 29, 2026",fac:"Amitabh Sharma Sir"},
  {n:42,ch:"Salt Analysis",topic:"Analysis of Anions (Acid Radicals)",date:"Mon, Dec 1, 2026",fac:"Amitabh Sharma Sir"},
  {n:43,ch:"Salt Analysis",topic:"Individual Test of Anions, Class A Group 1",date:"Tue, Dec 2, 2026",fac:"Amitabh Sharma Sir"},
  {n:44,ch:"Salt Analysis",topic:"Group I: Anions with dil. HCl/H₂SO₄",date:"Wed, Dec 3, 2026",fac:"Amitabh Sharma Sir"},
  {n:45,ch:"Salt Analysis",topic:"Group I: Anions with dil. HCl/H₂SO₄",date:"Thu, Dec 4, 2026",fac:"Amitabh Sharma Sir"},
  {n:46,ch:"Salt Analysis",topic:"Class B Radicals: Group II",date:"Fri, Dec 5, 2026",fac:"Amitabh Sharma Sir"},
  {n:47,ch:"Salt Analysis",topic:"Analysis of Cations (Basic Radicals), Separation",date:"Sat, Dec 6, 2026",fac:"Amitabh Sharma Sir"},
  {n:48,ch:"Salt Analysis",topic:"Identification of Basic Radical",date:"Mon, Dec 8, 2026",fac:"Amitabh Sharma Sir"},
  {n:49,ch:"Salt Analysis",topic:"Some Important Concepts",date:"Tue, Dec 9, 2026",fac:"Amitabh Sharma Sir"},
  {n:50,ch:"Salt Analysis",topic:"Some Important Concepts",date:"Wed, Dec 10, 2026",fac:"Amitabh Sharma Sir"},
  {n:51,ch:"P-block Elements",topic:"Group 13 & 14: B, Al, C, Si",date:"Thu, Dec 11, 2026",fac:"Amitabh Sharma Sir"},
  {n:52,ch:"P-block Elements",topic:"Carbon Allotropes, Compounds of C & Si",date:"Fri, Dec 12, 2026",fac:"Amitabh Sharma Sir"},
  {n:53,ch:"P-block Elements",topic:"Group 15: Nitrogen Family",date:"Sat, Dec 13, 2026",fac:"Amitabh Sharma Sir"},
  {n:54,ch:"P-block Elements",topic:"Group 15-18: P, O, S, Halogens, Noble Gases",date:"Mon, Dec 15, 2026",fac:"Amitabh Sharma Sir"},
  {n:55,ch:"d & f Block Elements",topic:"Introduction, Electronic Config, Physical Properties, Transition Elements",date:"Tue, Dec 16, 2026",fac:"Amitabh Sharma Sir"},
  {n:56,ch:"Metallurgy (Recorded)",topic:"Main Steps, Alloys, Furnaces, Metallurgy of Metals",date:"Wed, Dec 17, 2026",fac:"Amitabh Sharma Sir"},
  {n:57,ch:"Hydrogen & Compound (Recorded)",topic:"Position, Dihydrogen, Isotopes, Hydrides, Water, Hardness",date:"Thu, Dec 18, 2026",fac:"Amitabh Sharma Sir"},
  {n:58,ch:"S-block Elements (Recorded)",topic:"Group 1 & 2: Properties, Compounds, Biological Importance",date:"Fri, Dec 19, 2026",fac:"Amitabh Sharma Sir"},
];

// ── ORGANIC CHEMISTRY LECTURES ──────────────────────────────────────────────
const OCHEM_LECS = [
  {n:1,ch:"IUPAC Nomenclature",topic:"Structural Representation of Organic Compounds",date:"Mon, Aug 11, 2026",fac:"Rohit Agarwal Sir"},
  {n:2,ch:"IUPAC Nomenclature",topic:"Some Important Definitions",date:"Tue, Aug 12, 2026",fac:"Rohit Agarwal Sir"},
  {n:3,ch:"IUPAC Nomenclature",topic:"IUPAC System of Nomenclature",date:"Wed, Aug 13, 2026",fac:"Rohit Agarwal Sir"},
  {n:4,ch:"IUPAC Nomenclature",topic:"IUPAC System of Nomenclature",date:"Thu, Aug 14, 2026",fac:"Rohit Agarwal Sir"},
  {n:5,ch:"IUPAC Nomenclature",topic:"IUPAC System of Nomenclature",date:"Sat, Aug 16, 2026",fac:"Rohit Agarwal Sir"},
  {n:6,ch:"IUPAC Nomenclature",topic:"Nomenclature of Hydrocarbon",date:"Mon, Aug 18, 2026",fac:"Rohit Agarwal Sir"},
  {n:7,ch:"IUPAC Nomenclature",topic:"Nomenclature without Carbon-containing Group",date:"Tue, Aug 19, 2026",fac:"Rohit Agarwal Sir"},
  {n:8,ch:"IUPAC Nomenclature",topic:"Nomenclature with Polyfunctional Group",date:"Wed, Aug 20, 2026",fac:"Rohit Agarwal Sir"},
  {n:9,ch:"IUPAC Nomenclature",topic:"Nomenclature of Some Other Compounds",date:"Thu, Aug 21, 2026",fac:"Rohit Agarwal Sir"},
  {n:10,ch:"General Organic Chemistry",topic:"Bond Fission, Reaction Intermediates",date:"Fri, Aug 22, 2026",fac:"Rohit Agarwal Sir"},
  {n:11,ch:"General Organic Chemistry",topic:"Reaction Reagents",date:"Sat, Aug 23, 2026",fac:"Rohit Agarwal Sir"},
  {n:12,ch:"General Organic Chemistry",topic:"Electronic Displacement in Organic Compound",date:"Mon, Aug 25, 2026",fac:"Rohit Agarwal Sir"},
  {n:13,ch:"General Organic Chemistry",topic:"Inductive Effect",date:"Tue, Aug 26, 2026",fac:"Rohit Agarwal Sir"},
  {n:14,ch:"General Organic Chemistry",topic:"Resonance Effect",date:"Thu, Aug 28, 2026",fac:"Rohit Agarwal Sir"},
  {n:15,ch:"General Organic Chemistry",topic:"Mesomeric Effect",date:"Fri, Aug 29, 2026",fac:"Rohit Agarwal Sir"},
  {n:16,ch:"General Organic Chemistry",topic:"Steric Inhibition of Resonance (SIR Effect)",date:"Sat, Aug 30, 2026",fac:"Rohit Agarwal Sir"},
  {n:17,ch:"General Organic Chemistry",topic:"Hyper Conjugation Effect",date:"Mon, Sep 1, 2026",fac:"Rohit Agarwal Sir"},
  {n:18,ch:"General Organic Chemistry",topic:"Electromeric Effect",date:"Tue, Sep 2, 2026",fac:"Rohit Agarwal Sir"},
  {n:19,ch:"General Organic Chemistry",topic:"Types of Organic Reactions",date:"Wed, Sep 3, 2026",fac:"Rohit Agarwal Sir"},
  {n:20,ch:"General Organic Chemistry",topic:"Aromaticity",date:"Thu, Sep 4, 2026",fac:"Rohit Agarwal Sir"},
  {n:21,ch:"General Organic Chemistry",topic:"Basic Strength of Organic Bases, Acidic Strength",date:"Fri, Sep 5, 2026",fac:"Rohit Agarwal Sir"},
  {n:22,ch:"Isomerism",topic:"Isomerism",date:"Sat, Sep 6, 2026",fac:"Rohit Agarwal Sir"},
  {n:23,ch:"Isomerism",topic:"Conformational Isomerism",date:"Mon, Sep 8, 2026",fac:"Rohit Agarwal Sir"},
  {n:24,ch:"Isomerism",topic:"Conformational Isomerism",date:"Tue, Sep 9, 2026",fac:"Rohit Agarwal Sir"},
  {n:25,ch:"Isomerism",topic:"Configurational Isomerism and its Types",date:"Wed, Sep 10, 2026",fac:"Rohit Agarwal Sir"},
  {n:26,ch:"Isomerism",topic:"Geometrical Isomerism",date:"Thu, Sep 11, 2026",fac:"Rohit Agarwal Sir"},
  {n:27,ch:"Isomerism",topic:"Properties of Geometrical Isomers",date:"Fri, Sep 12, 2026",fac:"Rohit Agarwal Sir"},
  {n:28,ch:"Isomerism",topic:"Properties of Geometrical Isomers",date:"Sat, Sep 13, 2026",fac:"Rohit Agarwal Sir"},
  {n:29,ch:"Isomerism",topic:"Nomenclature of Geometrical Isomers",date:"Mon, Sep 15, 2026",fac:"Rohit Agarwal Sir"},
  {n:30,ch:"Isomerism",topic:"Nomenclature of Geometrical Isomers",date:"Tue, Sep 16, 2026",fac:"Rohit Agarwal Sir"},
  {n:31,ch:"Isomerism",topic:"Optical Isomerism",date:"Wed, Sep 17, 2026",fac:"Rohit Agarwal Sir"},
  {n:32,ch:"Isomerism",topic:"Optical Isomerism",date:"Thu, Sep 18, 2026",fac:"Rohit Agarwal Sir"},
  {n:33,ch:"Isomerism",topic:"Optical Isomerism",date:"Fri, Sep 19, 2026",fac:"Rohit Agarwal Sir"},
  {n:34,ch:"Isomerism",topic:"Optical Isomerism",date:"Sat, Sep 20, 2026",fac:"Rohit Agarwal Sir"},
  {n:35,ch:"Isomerism",topic:"Optical Isomerism",date:"Mon, Sep 22, 2026",fac:"Rohit Agarwal Sir"},
  {n:36,ch:"Hydrocarbon",topic:"Alkane: Introduction, Preparation, Physical Properties",date:"Tue, Sep 23, 2026",fac:"Rohit Agarwal Sir"},
  {n:37,ch:"Hydrocarbon",topic:"Chemical Properties of Alkane, Uses",date:"Wed, Sep 24, 2026",fac:"Rohit Agarwal Sir"},
  {n:38,ch:"Hydrocarbon",topic:"Alkene: Preparation, Properties",date:"Thu, Sep 25, 2026",fac:"Rohit Agarwal Sir"},
  {n:39,ch:"Hydrocarbon",topic:"Chemical Properties of Alkene, Test of Unsaturation",date:"Fri, Sep 26, 2026",fac:"Rohit Agarwal Sir"},
  {n:40,ch:"Hydrocarbon",topic:"Alkyne: Preparation, Physical Properties",date:"Sat, Sep 27, 2026",fac:"Rohit Agarwal Sir"},
  {n:41,ch:"Hydrocarbon",topic:"Chemical Properties of Alkyne, Aromatic Hydrocarbon",date:"Mon, Sep 29, 2026",fac:"Rohit Agarwal Sir"},
  {n:42,ch:"Hydrocarbon",topic:"Benzene: Preparation, Physical Properties",date:"Tue, Sep 30, 2026",fac:"Rohit Agarwal Sir"},
  {n:43,ch:"Hydrocarbon",topic:"Chemical Properties of Benzene, Uses",date:"Wed, Oct 1, 2026",fac:"Rohit Agarwal Sir"},
  {n:44,ch:"Hydrocarbon",topic:"Electrophilic Substitution of Mono-substituted Benzene",date:"Fri, Oct 3, 2026",fac:"Rohit Agarwal Sir"},
  {n:45,ch:"Hydrocarbon",topic:"Toluene: Preparation, Physical Properties",date:"Sat, Oct 4, 2026",fac:"Rohit Agarwal Sir"},
  {n:46,ch:"Hydrocarbon",topic:"Chemical Properties of Toluene",date:"Mon, Oct 6, 2026",fac:"Rohit Agarwal Sir"},
  {n:47,ch:"Hydrocarbon",topic:"Uses of Toluene",date:"Tue, Oct 7, 2026",fac:"Rohit Agarwal Sir"},
  {n:48,ch:"Haloalkanes & Haloarenes",topic:"Substitution and Elimination",date:"Wed, Oct 8, 2026",fac:"Rohit Agarwal Sir"},
  {n:49,ch:"Haloalkanes & Haloarenes",topic:"Substitution and Elimination",date:"Thu, Oct 9, 2026",fac:"Rohit Agarwal Sir"},
  {n:50,ch:"Haloalkanes & Haloarenes",topic:"Substitution and Elimination",date:"Fri, Oct 10, 2026",fac:"Rohit Agarwal Sir"},
  {n:51,ch:"Haloalkanes & Haloarenes",topic:"Substitution and Elimination",date:"Sat, Oct 11, 2026",fac:"Rohit Agarwal Sir"},
  {n:52,ch:"Haloalkanes & Haloarenes",topic:"Substitution and Elimination",date:"Mon, Oct 13, 2026",fac:"Rohit Agarwal Sir"},
  {n:53,ch:"Haloalkanes & Haloarenes",topic:"Substitution and Elimination",date:"Tue, Oct 14, 2026",fac:"Rohit Agarwal Sir"},
  {n:54,ch:"Haloalkanes & Haloarenes",topic:"Substitution and Elimination",date:"Wed, Oct 15, 2026",fac:"Rohit Agarwal Sir"},
  {n:55,ch:"Haloalkanes & Haloarenes",topic:"Substitution and Elimination",date:"Thu, Oct 16, 2026",fac:"Rohit Agarwal Sir"},
  {n:56,ch:"Alcohols, Phenols & Ethers",topic:"Reduction",date:"Fri, Oct 17, 2026",fac:"Rohit Agarwal Sir"},
  {n:57,ch:"Alcohols, Phenols & Ethers",topic:"Reduction",date:"Fri, Oct 24, 2026",fac:"Rohit Agarwal Sir"},
  {n:58,ch:"Alcohols, Phenols & Ethers",topic:"Oxidation",date:"Sat, Oct 25, 2026",fac:"Rohit Agarwal Sir"},
  {n:59,ch:"Alcohols, Phenols & Ethers",topic:"POC",date:"Wed, Oct 29, 2026",fac:"Rohit Agarwal Sir"},
  {n:60,ch:"Alcohols, Phenols & Ethers",topic:"Carbene and Nitrene",date:"Thu, Oct 30, 2026",fac:"Rohit Agarwal Sir"},
  {n:61,ch:"Alcohols, Phenols & Ethers",topic:"Carbene and Nitrene",date:"Fri, Oct 31, 2026",fac:"Rohit Agarwal Sir"},
  {n:62,ch:"Aldehydes, Ketones & Carboxylic Acids",topic:"Introduction, Nomenclature, Preparation, Nucleophilic Addition",date:"Sat, Nov 1, 2026",fac:"Rohit Agarwal Sir"},
  {n:63,ch:"Aldehydes, Ketones & Carboxylic Acids",topic:"Preparation, Physical Properties, Chemical Reactions",date:"Mon, Nov 3, 2026",fac:"Rohit Agarwal Sir"},
  {n:64,ch:"Aldehydes, Ketones & Carboxylic Acids",topic:"ALDOL, Perkin, Knoevenagel, Cannizzaro, Wittig, Reduction",date:"Tue, Nov 4, 2026",fac:"Rohit Agarwal Sir"},
  {n:65,ch:"Aldehydes, Ketones & Carboxylic Acids",topic:"Miscellaneous Reactions, Tests, Carboxylic Acids, Amides",date:"Wed, Nov 5, 2026",fac:"Rohit Agarwal Sir"},
  {n:66,ch:"Aldehydes, Ketones & Carboxylic Acids",topic:"Reactions of Carboxylic Acids, Decarboxylation, HVZ",date:"Thu, Nov 6, 2026",fac:"Rohit Agarwal Sir"},
  {n:67,ch:"Aldehydes, Ketones & Carboxylic Acids",topic:"General Reactions, Acid Chlorides, Amides, Ester, Anhydrides",date:"Fri, Nov 7, 2026",fac:"Rohit Agarwal Sir"},
  {n:68,ch:"Amines",topic:"Physical Properties and POC",date:"Sat, Nov 8, 2026",fac:"Rohit Agarwal Sir"},
  {n:69,ch:"Biomolecules",topic:"Carbohydrates: Glucose, Fructose, Disaccharides, Polysaccharides",date:"Mon, Nov 10, 2026",fac:"Rohit Agarwal Sir"},
  {n:70,ch:"Biomolecules",topic:"Proteins, Amino Acids, Vitamins, Nucleic Acids, Polymers",date:"Tue, Nov 11, 2026",fac:"Rohit Agarwal Sir"},
  {n:71,ch:"Polymers (Recorded)",topic:"Classification, Addition/Condensation Polymers, Rubber, Biodegradable",date:"Wed, Dec 24, 2026",fac:"Rohit Agarwal Sir"},
  {n:72,ch:"Chemistry in Everyday Life (Recorded)",topic:"Drugs, Drug-Target Interaction, Chemicals in Food",date:"Fri, Dec 26, 2026",fac:"Rohit Agarwal Sir"},
  {n:73,ch:"Environmental Chemistry (Recorded)",topic:"Pollution Types, Acid Rain, Smog, Ozone, Water Pollution, Green Chemistry",date:"Sat, Dec 27, 2026",fac:"Rohit Agarwal Sir"},
];

// ── MATHEMATICS LECTURES (key ones) ────────────────────────────────────────
const MATHS_LECS = [
  {n:1,ch:"Basic Mathematics",topic:"Number System",date:"Mon, Apr 21, 2026",fac:"Ashish Aggrawal Sir"},
  {n:2,ch:"Basic Mathematics",topic:"Number System",date:"Tue, Apr 22, 2026",fac:"Ashish Aggrawal Sir"},
  {n:3,ch:"Basic Mathematics",topic:"Number System",date:"Wed, Apr 23, 2026",fac:"Ashish Aggrawal Sir"},
  {n:4,ch:"Basic Mathematics",topic:"Number System",date:"Thu, Apr 24, 2026",fac:"Ashish Aggrawal Sir"},
  {n:5,ch:"Basic Mathematics",topic:"Wavy Curve Method",date:"Fri, Apr 25, 2026",fac:"Ashish Aggrawal Sir"},
  {n:6,ch:"Basic Mathematics",topic:"Wavy Curve Method",date:"Sat, Apr 26, 2026",fac:"Ashish Aggrawal Sir"},
  {n:7,ch:"Basic Mathematics",topic:"Wavy Curve Method",date:"Mon, Apr 28, 2026",fac:"Ashish Aggrawal Sir"},
  {n:8,ch:"Basic Mathematics",topic:"Wavy Curve Method",date:"Tue, Apr 29, 2026",fac:"Ashish Aggrawal Sir"},
  {n:9,ch:"Basic Mathematics",topic:"Wavy Curve Method",date:"Wed, Apr 30, 2026",fac:"Ashish Aggrawal Sir"},
  {n:10,ch:"Basic Mathematics",topic:"Logarithm",date:"Fri, May 2, 2026",fac:"Ashish Aggrawal Sir"},
  {n:11,ch:"Basic Mathematics",topic:"Logarithm",date:"Sat, May 3, 2026",fac:"Ashish Aggrawal Sir"},
  {n:12,ch:"Basic Mathematics",topic:"Logarithm",date:"Mon, May 5, 2026",fac:"Ashish Aggrawal Sir"},
  {n:13,ch:"Basic Mathematics",topic:"Modulus",date:"Tue, May 6, 2026",fac:"Ashish Aggrawal Sir"},
  {n:14,ch:"Basic Mathematics",topic:"Modulus",date:"Wed, May 7, 2026",fac:"Ashish Aggrawal Sir"},
  {n:15,ch:"Basic Mathematics",topic:"Modulus",date:"Thu, May 8, 2026",fac:"Ashish Aggrawal Sir"},
  {n:16,ch:"Basic Mathematics",topic:"Modulus",date:"Fri, May 9, 2026",fac:"Ashish Aggrawal Sir"},
  {n:17,ch:"Basic Mathematics",topic:"Modulus",date:"Sat, May 10, 2026",fac:"Ashish Aggrawal Sir"},
  {n:18,ch:"Quadratic Equations",topic:"Introduction",date:"Mon, May 12, 2026",fac:"Ashish Aggrawal Sir"},
  {n:19,ch:"Quadratic Equations",topic:"Common Roots",date:"Tue, May 13, 2026",fac:"Ashish Aggrawal Sir"},
  {n:20,ch:"Quadratic Equations",topic:"Theory of Equation",date:"Wed, May 14, 2026",fac:"Ashish Aggrawal Sir"},
  {n:21,ch:"Quadratic Equations",topic:"Graph of ax²+bx+c",date:"Thu, May 15, 2026",fac:"Ashish Aggrawal Sir"},
  {n:22,ch:"Quadratic Equations",topic:"Sign of ax²+bx+c",date:"Fri, May 16, 2026",fac:"Ashish Aggrawal Sir"},
  {n:23,ch:"Quadratic Equations",topic:"Location of Roots",date:"Sat, May 17, 2026",fac:"Ashish Aggrawal Sir"},
  {n:24,ch:"Quadratic Equations",topic:"Some Results",date:"Mon, May 19, 2026",fac:"Ashish Aggrawal Sir"},
  {n:25,ch:"Quadratic Equations",topic:"Descartes' Rule of Signs",date:"Tue, May 20, 2026",fac:"Ashish Aggrawal Sir"},
  {n:26,ch:"Quadratic Equations",topic:"Descartes' Rule of Signs",date:"Wed, May 21, 2026",fac:"Ashish Aggrawal Sir"},
  {n:27,ch:"Sequence and Series",topic:"Introduction",date:"Thu, May 22, 2026",fac:"Ashish Aggrawal Sir"},
  {n:28,ch:"Sequence and Series",topic:"Arithmetic Progression (AP)",date:"Fri, May 23, 2026",fac:"Ashish Aggrawal Sir"},
  {n:29,ch:"Sequence and Series",topic:"Geometric Progression (GP)",date:"Sat, May 24, 2026",fac:"Ashish Aggrawal Sir"},
  {n:30,ch:"Sequence and Series",topic:"Harmonic Progression (HP)",date:"Mon, May 26, 2026",fac:"Ashish Aggrawal Sir"},
  {n:31,ch:"Sequence and Series",topic:"Insertion of Means Between Two Numbers",date:"Tue, May 27, 2026",fac:"Ashish Aggrawal Sir"},
  {n:32,ch:"Sequence and Series",topic:"Properties of Means, AGS",date:"Wed, May 28, 2026",fac:"Ashish Aggrawal Sir"},
  {n:33,ch:"Sequence and Series",topic:"Summation, Method of Difference",date:"Thu, May 29, 2026",fac:"Ashish Aggrawal Sir"},
  {n:34,ch:"Sequence and Series",topic:"Telescopic Series",date:"Fri, May 30, 2026",fac:"Ashish Aggrawal Sir"},
  {n:35,ch:"Trigonometric Functions",topic:"Introduction",date:"Sat, May 31, 2026",fac:"Ashish Aggrawal Sir"},
  {n:36,ch:"Trigonometric Functions",topic:"Trigonometrical Ratios for Acute Angle",date:"Mon, Jun 2, 2026",fac:"Ashish Aggrawal Sir"},
  {n:37,ch:"Trigonometric Functions",topic:"Basic Identities, Sign Convention",date:"Tue, Jun 3, 2026",fac:"Ashish Aggrawal Sir"},
  {n:38,ch:"Trigonometric Functions",topic:"Domain/Range of Trigonometrical Functions",date:"Wed, Jun 4, 2026",fac:"Ashish Aggrawal Sir"},
  {n:39,ch:"Trigonometric Functions",topic:"Allied Angles, Sum/Difference Formulae, Multiple Angles",date:"Thu, Jun 5, 2026",fac:"Ashish Aggrawal Sir"},
  {n:40,ch:"Trigonometric Functions",topic:"Transformation Formulae, Identities",date:"Sat, Jun 7, 2026",fac:"Ashish Aggrawal Sir"},
  {n:41,ch:"Trigonometric Functions",topic:"Maximum/Minimum Value",date:"Mon, Jun 9, 2026",fac:"Ashish Aggrawal Sir"},
  {n:42,ch:"Trigonometric Functions",topic:"Some Series, Telescopic Series",date:"Tue, Jun 10, 2026",fac:"Ashish Aggrawal Sir"},
  {n:43,ch:"Trigonometric Equation",topic:"Introduction",date:"Wed, Jun 11, 2026",fac:"Ashish Aggrawal Sir"},
  {n:44,ch:"Trigonometric Equation",topic:"Solution",date:"Thu, Jun 12, 2026",fac:"Ashish Aggrawal Sir"},
  {n:45,ch:"Trigonometric Equation",topic:"Types of Trigonometrical Equation",date:"Fri, Jun 13, 2026",fac:"Ashish Aggrawal Sir"},
  {n:46,ch:"Trigonometric Equation",topic:"Types of Trigonometrical Equation",date:"Sat, Jun 14, 2026",fac:"Ashish Aggrawal Sir"},
  {n:47,ch:"Permutations & Combinations",topic:"Introduction, Counting, Permutation",date:"Mon, Jun 16, 2026",fac:"Ashish Aggrawal Sir"},
  {n:48,ch:"Permutations & Combinations",topic:"Circular Permutation, Combination",date:"Tue, Jun 17, 2026",fac:"Ashish Aggrawal Sir"},
  {n:49,ch:"Permutations & Combinations",topic:"Divisors",date:"Wed, Jun 18, 2026",fac:"Ashish Aggrawal Sir"},
  {n:50,ch:"Permutations & Combinations",topic:"Exponent",date:"Thu, Jun 19, 2026",fac:"Ashish Aggrawal Sir"},
  {n:51,ch:"Permutations & Combinations",topic:"Division and Distribution",date:"Fri, Jun 20, 2026",fac:"Ashish Aggrawal Sir"},
  {n:52,ch:"Permutations & Combinations",topic:"Division and Distribution",date:"Sat, Jun 21, 2026",fac:"Ashish Aggrawal Sir"},
  {n:53,ch:"Permutations & Combinations",topic:"Derangement",date:"Mon, Jun 23, 2026",fac:"Ashish Aggrawal Sir"},
  {n:54,ch:"Permutations & Combinations",topic:"Some Rules",date:"Tue, Jun 24, 2026",fac:"Ashish Aggrawal Sir"},
  {n:55,ch:"Binomial Theorem",topic:"Introduction, Expansion of (x+a)ⁿ",date:"Wed, Jun 25, 2026",fac:"Ashish Aggrawal Sir"},
  {n:56,ch:"Binomial Theorem",topic:"General Terms, Middle Terms",date:"Thu, Jun 26, 2026",fac:"Ashish Aggrawal Sir"},
  {n:57,ch:"Binomial Theorem",topic:"Numerically Greatest Term",date:"Fri, Jun 27, 2026",fac:"Ashish Aggrawal Sir"},
  {n:58,ch:"Binomial Theorem",topic:"Sum of Coefficients, Summation of Series",date:"Sat, Jun 28, 2026",fac:"Ashish Aggrawal Sir"},
  {n:59,ch:"Binomial Theorem",topic:"Multinomial Theorem",date:"Mon, Jun 30, 2026",fac:"Ashish Aggrawal Sir"},
  {n:60,ch:"Binomial Theorem",topic:"Binomial Theorem for Any Index",date:"Tue, Jul 1, 2026",fac:"Ashish Aggrawal Sir"},
  {n:61,ch:"Straight Lines",topic:"Introduction, Section Formula",date:"Wed, Jul 2, 2026",fac:"Ashish Aggrawal Sir"},
  {n:62,ch:"Straight Lines",topic:"Different Centre of Triangle",date:"Thu, Jul 3, 2026",fac:"Ashish Aggrawal Sir"},
  {n:63,ch:"Straight Lines",topic:"Area, Locus",date:"Fri, Jul 4, 2026",fac:"Ashish Aggrawal Sir"},
  {n:64,ch:"Straight Lines",topic:"Straight Line, Slope",date:"Sat, Jul 5, 2026",fac:"Ashish Aggrawal Sir"},
  {n:65,ch:"Straight Lines",topic:"Standard Form, Position of Point",date:"Mon, Jul 7, 2026",fac:"Ashish Aggrawal Sir"},
  {n:66,ch:"Straight Lines",topic:"Angle Between Two Lines",date:"Tue, Jul 8, 2026",fac:"Ashish Aggrawal Sir"},
  {n:67,ch:"Straight Lines",topic:"Perpendicular Distance, Concurrent Lines, Angle Bisector",date:"Wed, Jul 9, 2026",fac:"Ashish Aggrawal Sir"},
  {n:68,ch:"Straight Lines",topic:"Transformation of Axis, Pair of Straight Lines",date:"Thu, Jul 10, 2026",fac:"Ashish Aggrawal Sir"},
  {n:69,ch:"Circles",topic:"Introduction, General Equation",date:"Fri, Jul 11, 2026",fac:"Ashish Aggrawal Sir"},
  {n:70,ch:"Circles",topic:"Diameter Form, Parametric Form",date:"Sat, Jul 12, 2026",fac:"Ashish Aggrawal Sir"},
  {n:71,ch:"Circles",topic:"Intercept, Position of Point/Line w.r.t. Circle",date:"Mon, Jul 14, 2026",fac:"Ashish Aggrawal Sir"},
  {n:72,ch:"Circles",topic:"Tangent, Normal, Director Circle, Chord",date:"Tue, Jul 15, 2026",fac:"Ashish Aggrawal Sir"},
  {n:73,ch:"Circles",topic:"Pair of Tangent, Radical Axis",date:"Wed, Jul 16, 2026",fac:"Ashish Aggrawal Sir"},
  {n:74,ch:"Circles",topic:"Family of Circles, Common Tangent",date:"Thu, Jul 17, 2026",fac:"Ashish Aggrawal Sir"},
  {n:75,ch:"Circles",topic:"Angle of Intersection, Orthogonality",date:"Fri, Jul 18, 2026",fac:"Ashish Aggrawal Sir"},
  {n:76,ch:"Circles",topic:"Circle Circumscribing Triangle/Quadrilateral",date:"Sat, Jul 19, 2026",fac:"Ashish Aggrawal Sir"},
  {n:77,ch:"Conic: Parabola",topic:"Introduction, Standard Form, Parametric Form",date:"Mon, Jul 21, 2026",fac:"Ashish Aggrawal Sir"},
  {n:78,ch:"Conic: Parabola",topic:"Types, General Equation, Focal Distance",date:"Tue, Jul 22, 2026",fac:"Ashish Aggrawal Sir"},
  {n:79,ch:"Conic: Parabola",topic:"Position of Point/Line w.r.t. Parabola",date:"Wed, Jul 23, 2026",fac:"Ashish Aggrawal Sir"},
  {n:80,ch:"Conic: Parabola",topic:"Tangent, Normal",date:"Thu, Jul 24, 2026",fac:"Ashish Aggrawal Sir"},
  {n:81,ch:"Conic: Parabola",topic:"Properties of Tangent & Normal, Focal Chord",date:"Fri, Jul 25, 2026",fac:"Ashish Aggrawal Sir"},
  {n:82,ch:"Conic: Parabola",topic:"Chord of Contact, Chord in Mid-Point Form",date:"Sat, Jul 26, 2026",fac:"Ashish Aggrawal Sir"},
  {n:83,ch:"Conic: Parabola",topic:"Pair of Tangents, Director Circle, Properties",date:"Mon, Jul 28, 2026",fac:"Ashish Aggrawal Sir"},
  {n:84,ch:"Conic: Ellipse",topic:"Introduction, Standard Form, Auxiliary Circle",date:"Tue, Jul 29, 2026",fac:"Ashish Aggrawal Sir"},
  {n:85,ch:"Conic: Ellipse",topic:"General Equation, Another Definition",date:"Wed, Jul 30, 2026",fac:"Ashish Aggrawal Sir"},
  {n:86,ch:"Conic: Ellipse",topic:"Focal Distance, Position of Point",date:"Thu, Jul 31, 2026",fac:"Ashish Aggrawal Sir"},
  {n:87,ch:"Conic: Ellipse",topic:"Position of Line, Tangent",date:"Fri, Aug 1, 2026",fac:"Ashish Aggrawal Sir"},
  {n:88,ch:"Conic: Ellipse",topic:"Normal, Chord Equation",date:"Sat, Aug 2, 2026",fac:"Ashish Aggrawal Sir"},
  {n:89,ch:"Conic: Ellipse",topic:"Director Circle, Properties",date:"Mon, Aug 4, 2026",fac:"Ashish Aggrawal Sir"},
  {n:90,ch:"Conic: Hyperbola",topic:"Introduction, Standard Form",date:"Tue, Aug 5, 2026",fac:"Ashish Aggrawal Sir"},
  {n:91,ch:"Conic: Hyperbola",topic:"General Equation, Auxiliary Circle",date:"Wed, Aug 6, 2026",fac:"Ashish Aggrawal Sir"},
  {n:92,ch:"Conic: Hyperbola",topic:"Focal Distance, Position of Point/Line",date:"Thu, Aug 7, 2026",fac:"Ashish Aggrawal Sir"},
  {n:93,ch:"Conic: Hyperbola",topic:"Tangent, Normal, Properties, Chord",date:"Sat, Aug 9, 2026",fac:"Ashish Aggrawal Sir"},
  {n:94,ch:"Conic: Hyperbola",topic:"Pair of Tangents, Director Circle, Asymptotes",date:"Mon, Aug 11, 2026",fac:"Ashish Aggrawal Sir"},
  {n:95,ch:"Conic: Hyperbola",topic:"Rectangular Hyperbola, Properties",date:"Tue, Aug 12, 2026",fac:"Ashish Aggrawal Sir"},
  {n:96,ch:"Determinants",topic:"Introduction, Minor and Cofactor",date:"Wed, Aug 13, 2026",fac:"Ashish Aggrawal Sir"},
  {n:97,ch:"Determinants",topic:"General Properties",date:"Thu, Aug 14, 2026",fac:"Ashish Aggrawal Sir"},
  {n:98,ch:"Determinants",topic:"Addition, Summation, Product, Differentiation",date:"Sat, Aug 16, 2026",fac:"Ashish Aggrawal Sir"},
  {n:99,ch:"Determinants",topic:"Solution of Equations",date:"Mon, Aug 18, 2026",fac:"Ashish Aggrawal Sir"},
  {n:100,ch:"Matrices",topic:"Introduction, Types, Equality",date:"Tue, Aug 19, 2026",fac:"Ashish Aggrawal Sir"},
  {n:101,ch:"Matrices",topic:"Trace, Determinants, Operations",date:"Wed, Aug 20, 2026",fac:"Ashish Aggrawal Sir"},
  {n:102,ch:"Matrices",topic:"Matrix Polynomial, Transpose",date:"Thu, Aug 21, 2026",fac:"Ashish Aggrawal Sir"},
  {n:103,ch:"Matrices",topic:"Symmetric, Skew Symmetric Matrix",date:"Fri, Aug 22, 2026",fac:"Ashish Aggrawal Sir"},
  {n:104,ch:"Matrices",topic:"Orthogonal, Adjoint, Invertible, Elementary Operations",date:"Sat, Aug 23, 2026",fac:"Ashish Aggrawal Sir"},
  {n:105,ch:"Matrices",topic:"Inverse of a Matrix",date:"Mon, Aug 25, 2026",fac:"Ashish Aggrawal Sir"},
  {n:106,ch:"Matrices",topic:"Characteristic Equation, Equation Solving",date:"Tue, Aug 26, 2026",fac:"Ashish Aggrawal Sir"},
  {n:107,ch:"Sets",topic:"Introduction, Sets and Representation",date:"Thu, Aug 28, 2026",fac:"Ashish Aggrawal Sir"},
  {n:108,ch:"Sets",topic:"Types of Sets, Operations on Sets",date:"Fri, Aug 29, 2026",fac:"Ashish Aggrawal Sir"},
  {n:109,ch:"Sets",topic:"Algebra of Sets, Practical Problems",date:"Sat, Aug 30, 2026",fac:"Ashish Aggrawal Sir"},
  {n:110,ch:"Relations and Functions",topic:"Relation, Types of Relations",date:"Mon, Sep 1, 2026",fac:"Ashish Aggrawal Sir"},
  {n:111,ch:"Relations and Functions",topic:"Functions, Domain and Range",date:"Tue, Sep 2, 2026",fac:"Ashish Aggrawal Sir"},
  {n:112,ch:"Relations and Functions",topic:"Types of Functions, Equal Function",date:"Wed, Sep 3, 2026",fac:"Ashish Aggrawal Sir"},
  {n:113,ch:"Relations and Functions",topic:"Classification of Functions",date:"Thu, Sep 4, 2026",fac:"Ashish Aggrawal Sir"},
  {n:114,ch:"Relations and Functions",topic:"Composite Function",date:"Fri, Sep 5, 2026",fac:"Ashish Aggrawal Sir"},
  {n:115,ch:"Relations and Functions",topic:"Odd/Even Function",date:"Sat, Sep 6, 2026",fac:"Ashish Aggrawal Sir"},
  {n:116,ch:"Relations and Functions",topic:"Period of Function",date:"Mon, Sep 8, 2026",fac:"Ashish Aggrawal Sir"},
  {n:117,ch:"Relations and Functions",topic:"Inverse of Function",date:"Tue, Sep 9, 2026",fac:"Ashish Aggrawal Sir"},
  {n:118,ch:"Relations and Functions",topic:"Some Graphs and Transformations",date:"Wed, Sep 10, 2026",fac:"Ashish Aggrawal Sir"},
  {n:119,ch:"Relations and Functions",topic:"Functional Equation",date:"Thu, Sep 11, 2026",fac:"Ashish Aggrawal Sir"},
  {n:120,ch:"Inverse Trigonometric Functions",topic:"Introduction",date:"Fri, Sep 12, 2026",fac:"Ashish Aggrawal Sir"},
  {n:121,ch:"Inverse Trigonometric Functions",topic:"Domain/Range, Graph",date:"Sat, Sep 13, 2026",fac:"Ashish Aggrawal Sir"},
  {n:122,ch:"Inverse Trigonometric Functions",topic:"Properties of Inverse Circular Functions",date:"Mon, Sep 15, 2026",fac:"Ashish Aggrawal Sir"},
  {n:123,ch:"Inverse Trigonometric Functions",topic:"Some Graphs",date:"Tue, Sep 16, 2026",fac:"Ashish Aggrawal Sir"},
  {n:124,ch:"Limits, Continuity & Differentiability",topic:"Limit",date:"Wed, Sep 17, 2026",fac:"Ashish Aggrawal Sir"},
  {n:125,ch:"Limits, Continuity & Differentiability",topic:"Limit",date:"Thu, Sep 18, 2026",fac:"Ashish Aggrawal Sir"},
  {n:126,ch:"Limits, Continuity & Differentiability",topic:"Methods of Finding Limit",date:"Fri, Sep 19, 2026",fac:"Ashish Aggrawal Sir"},
  {n:127,ch:"Limits, Continuity & Differentiability",topic:"Sandwich Theorem, Newton-Leibnitz",date:"Sat, Sep 20, 2026",fac:"Ashish Aggrawal Sir"},
  {n:128,ch:"Limits, Continuity & Differentiability",topic:"Continuity",date:"Mon, Sep 22, 2026",fac:"Ashish Aggrawal Sir"},
  {n:129,ch:"Limits, Continuity & Differentiability",topic:"Continuity",date:"Tue, Sep 23, 2026",fac:"Ashish Aggrawal Sir"},
  {n:130,ch:"Limits, Continuity & Differentiability",topic:"Intermediate Mean Value Theorem",date:"Wed, Sep 24, 2026",fac:"Ashish Aggrawal Sir"},
  {n:131,ch:"Limits, Continuity & Differentiability",topic:"Differentiability",date:"Thu, Sep 25, 2026",fac:"Ashish Aggrawal Sir"},
  {n:132,ch:"Limits, Continuity & Differentiability",topic:"Differentiability",date:"Fri, Sep 26, 2026",fac:"Ashish Aggrawal Sir"},
  {n:133,ch:"Method of Differentiation",topic:"Differentiation",date:"Sat, Sep 27, 2026",fac:"Ashish Aggrawal Sir"},
  {n:134,ch:"Method of Differentiation",topic:"Differentiation",date:"Mon, Sep 29, 2026",fac:"Ashish Aggrawal Sir"},
  {n:135,ch:"Method of Differentiation",topic:"Differentiation",date:"Tue, Sep 30, 2026",fac:"Ashish Aggrawal Sir"},
  {n:136,ch:"Method of Differentiation",topic:"Differentiation",date:"Wed, Oct 1, 2026",fac:"Ashish Aggrawal Sir"},
  {n:137,ch:"Method of Differentiation",topic:"Differentiation",date:"Fri, Oct 3, 2026",fac:"Ashish Aggrawal Sir"},
  {n:138,ch:"Application of Derivatives",topic:"Rate of Change, Tangent and Normal",date:"Sat, Oct 4, 2026",fac:"Ashish Aggrawal Sir"},
  {n:139,ch:"Application of Derivatives",topic:"Shortest Distance, Approximation",date:"Mon, Oct 6, 2026",fac:"Ashish Aggrawal Sir"},
  {n:140,ch:"Application of Derivatives",topic:"Monotonicity, Stationary Points",date:"Tue, Oct 7, 2026",fac:"Ashish Aggrawal Sir"},
  {n:141,ch:"Application of Derivatives",topic:"Maxima and Minima, Global Extrema",date:"Wed, Oct 8, 2026",fac:"Ashish Aggrawal Sir"},
  {n:142,ch:"Application of Derivatives",topic:"Concavity, Rolle's Theorem",date:"Thu, Oct 9, 2026",fac:"Ashish Aggrawal Sir"},
  {n:143,ch:"Application of Derivatives",topic:"LMVT, Curve Sketching",date:"Fri, Oct 10, 2026",fac:"Ashish Aggrawal Sir"},
  {n:144,ch:"Indefinite Integration",topic:"Introduction, Algebra of Integration",date:"Sat, Oct 11, 2026",fac:"Ashish Aggrawal Sir"},
  {n:145,ch:"Indefinite Integration",topic:"Integration by Substitution, Trig Identities",date:"Mon, Oct 13, 2026",fac:"Ashish Aggrawal Sir"},
  {n:146,ch:"Indefinite Integration",topic:"Integration by Parts, Partial Fraction",date:"Tue, Oct 14, 2026",fac:"Ashish Aggrawal Sir"},
  {n:147,ch:"Indefinite Integration",topic:"Algebraic Function",date:"Wed, Oct 15, 2026",fac:"Ashish Aggrawal Sir"},
  {n:148,ch:"Indefinite Integration",topic:"Trigonometric Form, Special Types",date:"Thu, Oct 16, 2026",fac:"Ashish Aggrawal Sir"},
  {n:149,ch:"Indefinite Integration",topic:"Irrational Form",date:"Fri, Oct 17, 2026",fac:"Ashish Aggrawal Sir"},
  {n:150,ch:"Indefinite Integration",topic:"Reduction Form",date:"Fri, Oct 24, 2026",fac:"Ashish Aggrawal Sir"},
  {n:151,ch:"Definite Integration",topic:"Introduction",date:"Sat, Oct 25, 2026",fac:"Ashish Aggrawal Sir"},
  {n:152,ch:"Definite Integration",topic:"Properties",date:"Wed, Oct 29, 2026",fac:"Ashish Aggrawal Sir"},
  {n:153,ch:"Definite Integration",topic:"Properties",date:"Thu, Oct 30, 2026",fac:"Ashish Aggrawal Sir"},
  {n:154,ch:"Definite Integration",topic:"Newton-Leibnitz Theorem",date:"Fri, Oct 31, 2026",fac:"Ashish Aggrawal Sir"},
  {n:155,ch:"Definite Integration",topic:"Definite Integration as Limit as a Sum",date:"Sat, Nov 1, 2026",fac:"Ashish Aggrawal Sir"},
  {n:156,ch:"Definite Integration",topic:"Walli's Formula, Gamma Function, Estimation",date:"Mon, Nov 3, 2026",fac:"Ashish Aggrawal Sir"},
  {n:157,ch:"Application of Integrals",topic:"Area Between Two Curves",date:"Tue, Nov 4, 2026",fac:"Ashish Aggrawal Sir"},
  {n:158,ch:"Application of Integrals",topic:"Curve Sketching",date:"Wed, Nov 5, 2026",fac:"Ashish Aggrawal Sir"},
  {n:159,ch:"Application of Integrals",topic:"Curve Sketching",date:"Thu, Nov 6, 2026",fac:"Ashish Aggrawal Sir"},
  {n:160,ch:"Differential Equations",topic:"Introduction, Formation",date:"Fri, Nov 7, 2026",fac:"Ashish Aggrawal Sir"},
  {n:161,ch:"Differential Equations",topic:"Solution of Differential Equations",date:"Sat, Nov 8, 2026",fac:"Ashish Aggrawal Sir"},
  {n:162,ch:"Differential Equations",topic:"Orthogonal Trajectory",date:"Mon, Nov 10, 2026",fac:"Ashish Aggrawal Sir"},
  {n:163,ch:"Differential Equations",topic:"Clairaut's Equation",date:"Tue, Nov 11, 2026",fac:"Ashish Aggrawal Sir"},
  {n:164,ch:"Differential Equations",topic:"Application of Differential Equations",date:"Wed, Nov 12, 2026",fac:"Ashish Aggrawal Sir"},
  {n:165,ch:"Vector Algebra",topic:"Introduction, Types, Addition",date:"Thu, Nov 13, 2026",fac:"Ashish Aggrawal Sir"},
  {n:166,ch:"Vector Algebra",topic:"Proportion, Collinear Vector",date:"Fri, Nov 14, 2026",fac:"Ashish Aggrawal Sir"},
  {n:167,ch:"Vector Algebra",topic:"Coplanar, Orthogonal, Section Formula",date:"Sat, Nov 15, 2026",fac:"Ashish Aggrawal Sir"},
  {n:168,ch:"Vector Algebra",topic:"Scalar (Dot) Product",date:"Mon, Nov 17, 2026",fac:"Ashish Aggrawal Sir"},
  {n:169,ch:"Vector Algebra",topic:"Vector (Cross) Product",date:"Tue, Nov 18, 2026",fac:"Ashish Aggrawal Sir"},
  {n:170,ch:"Vector Algebra",topic:"Scalar Triple Product, Vector Triple Product",date:"Wed, Nov 19, 2026",fac:"Ashish Aggrawal Sir"},
  {n:171,ch:"Vector Algebra",topic:"Reciprocal System, Linearly Dependent/Independent",date:"Thu, Nov 20, 2026",fac:"Ashish Aggrawal Sir"},
  {n:172,ch:"3D Geometry",topic:"Introduction, Section Formulae",date:"Fri, Nov 21, 2026",fac:"Ashish Aggrawal Sir"},
  {n:173,ch:"3D Geometry",topic:"Direction Cosine, Direction Ratio, Line",date:"Sat, Nov 22, 2026",fac:"Ashish Aggrawal Sir"},
  {n:174,ch:"3D Geometry",topic:"Angle Between Lines, Perpendicular Distance",date:"Mon, Nov 24, 2026",fac:"Ashish Aggrawal Sir"},
  {n:175,ch:"3D Geometry",topic:"Plane, Position of Two Points w.r.t. Plane",date:"Tue, Nov 25, 2026",fac:"Ashish Aggrawal Sir"},
  {n:176,ch:"3D Geometry",topic:"Area, Perpendicular Distance from Plane, Angle Bisector",date:"Wed, Nov 26, 2026",fac:"Ashish Aggrawal Sir"},
  {n:177,ch:"3D Geometry",topic:"Family of Planes, Coplanar Lines, Skew Line",date:"Thu, Nov 27, 2026",fac:"Ashish Aggrawal Sir"},
  {n:178,ch:"Complex Numbers",topic:"Introduction, Algebraic Operations",date:"Fri, Nov 28, 2026",fac:"Ashish Aggrawal Sir"},
  {n:179,ch:"Complex Numbers",topic:"Argand Plane, Conjugate",date:"Sat, Nov 29, 2026",fac:"Ashish Aggrawal Sir"},
  {n:180,ch:"Complex Numbers",topic:"Modulus",date:"Mon, Dec 1, 2026",fac:"Ashish Aggrawal Sir"},
  {n:181,ch:"Complex Numbers",topic:"Argument",date:"Tue, Dec 2, 2026",fac:"Ashish Aggrawal Sir"},
  {n:182,ch:"Complex Numbers",topic:"Forms of Complex Numbers",date:"Wed, Dec 3, 2026",fac:"Ashish Aggrawal Sir"},
  {n:183,ch:"Complex Numbers",topic:"De Moivre's Theorem",date:"Thu, Dec 4, 2026",fac:"Ashish Aggrawal Sir"},
  {n:184,ch:"Complex Numbers",topic:"Cube Roots, nth Root of Unity",date:"Fri, Dec 5, 2026",fac:"Ashish Aggrawal Sir"},
  {n:185,ch:"Complex Numbers",topic:"Geometry of Complex Numbers",date:"Sat, Dec 6, 2026",fac:"Ashish Aggrawal Sir"},
  {n:186,ch:"Complex Numbers",topic:"Geometry of Complex Numbers",date:"Mon, Dec 8, 2026",fac:"Ashish Aggrawal Sir"},
  {n:187,ch:"Probability",topic:"Introduction, Events, Some Results",date:"Tue, Dec 9, 2026",fac:"Ashish Aggrawal Sir"},
  {n:188,ch:"Probability",topic:"Probability",date:"Wed, Dec 10, 2026",fac:"Ashish Aggrawal Sir"},
  {n:189,ch:"Probability",topic:"Some Theorems",date:"Thu, Dec 11, 2026",fac:"Ashish Aggrawal Sir"},
  {n:190,ch:"Probability",topic:"Independent Events",date:"Fri, Dec 12, 2026",fac:"Ashish Aggrawal Sir"},
  {n:191,ch:"Probability",topic:"Conditional Probability",date:"Sat, Dec 13, 2026",fac:"Ashish Aggrawal Sir"},
  {n:192,ch:"Probability",topic:"Bayes' Theorem",date:"Mon, Dec 15, 2026",fac:"Ashish Aggrawal Sir"},
  {n:193,ch:"Probability",topic:"Random Variable",date:"Tue, Dec 16, 2026",fac:"Ashish Aggrawal Sir"},
  {n:194,ch:"Probability",topic:"Binomial Theorem on Probability",date:"Wed, Dec 17, 2026",fac:"Ashish Aggrawal Sir"},
  {n:195,ch:"Statistics",topic:"Introduction, Variable, Frequency",date:"Thu, Dec 18, 2026",fac:"Ashish Aggrawal Sir"},
  {n:196,ch:"Statistics",topic:"Mean",date:"Fri, Dec 19, 2026",fac:"Ashish Aggrawal Sir"},
  {n:197,ch:"Statistics",topic:"Mode, Relation among Mean/Median/Mode",date:"Sat, Dec 20, 2026",fac:"Ashish Aggrawal Sir"},
  {n:198,ch:"Statistics",topic:"Measure of Dispersion, Variance",date:"Mon, Dec 22, 2026",fac:"Ashish Aggrawal Sir"},
  {n:199,ch:"Solution of Triangle",topic:"Sine Rule, Cosine Rule, Projection Formula",date:"Tue, Dec 23, 2026",fac:"Ashish Aggrawal Sir"},
  {n:200,ch:"Solution of Triangle",topic:"Napier's Analogy, Area of Triangle, Centres",date:"Wed, Dec 24, 2026",fac:"Ashish Aggrawal Sir"},
  {n:201,ch:"Solution of Triangle",topic:"Regular Polygon, Excentral Triangle",date:"Fri, Dec 26, 2026",fac:"Ashish Aggrawal Sir"},
];

// ── STORAGE KEY ──────────────────────────────────────────────────────────────
const SK = "prayas_jee_2026_v1";

function loadState() {
  try { return JSON.parse(localStorage.getItem(SK) || "{}"); } catch { return {}; }
}
function saveState(s) {
  try { localStorage.setItem(SK, JSON.stringify(s)); } catch {}
}

// ── CHIP ─────────────────────────────────────────────────────────────────────
function Chip({ label, col }) {
  return (
    <span style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}`, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ── TICK BOX ─────────────────────────────────────────────────────────────────
function Tick({ done, toggle, color }) {
  return (
    <button
      onClick={toggle}
      style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer",
        border: done ? "none" : "2px solid #d1d5db",
        background: done ? color : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, color: "#fff", transition: "all .15s"
      }}
    >{done ? "✓" : ""}</button>
  );
}

// ── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgBar({ done, total, color }) {
  const pct = total ? Math.round(done / total * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>
        <span>{done}/{total} done</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: 99, height: 7, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 99, transition: "width .4s" }} />
      </div>
    </div>
  );
}

// ── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHead({ emoji, title, sub }) {
  return (
    <div style={{ padding: "20px 16px 8px" }}>
      <div style={{ fontSize: 22, marginBottom: 2 }}>{emoji}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── LECTURE ROW ──────────────────────────────────────────────────────────────
function LecRow({ lec, done, toggle, chipColor, chipLabel }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
      borderBottom: "1px solid #f3f4f6",
      background: done ? "#f0fdf4" : "white",
      transition: "background .2s"
    }}>
      <Tick done={done} toggle={toggle} color={chipColor.text} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af" }}>L{lec.n}</span>
          <Chip label={chipLabel} col={chipColor} />
          <span style={{ fontSize: 10, color: "#9ca3af" }}>{lec.date}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: done ? 400 : 600, color: done ? "#9ca3af" : "#111827", textDecoration: done ? "line-through" : "none" }}>{lec.topic}</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{lec.ch} · {lec.fac}</div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PrayasPlanner() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState("tests");
  const [lecTab, setLecTab] = useState("phy");
  const [search, setSearch] = useState("");
  const [filterDone, setFilterDone] = useState("all");

  const toggle = useCallback((key) => {
    setState(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveState(next);
      return next;
    });
  }, []);

  // Tests
  const testDoneCount = TESTS.filter(t => state["test_" + t.id]).length;

  // Lec helpers
  const lecSets = { phy: PHYSICS_LECS, pchem: PCHEM_LECS, ichem: ICHEM_LECS, ochem: OCHEM_LECS, mat: MATHS_LECS };
  const lecColors = {
    phy: C.phy, pchem: C.che, ichem: C.ino || { bg: "#fff1f2", border: "#fecdd3", text: "#be123c" },
    ochem: C.org || { bg: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce" }, mat: C.mat
  };
  const lecLabels = { phy: "⚡ Physics", pchem: "🧪 PhyChem", ichem: "⚗️ InoChem", ochem: "🌿 OrgChem", mat: "📐 Maths" };
  const lecFacultyColor = {
    phy: C.phy, pchem: C.che,
    ichem: { bg: "#fff1f2", border: "#fecdd3", text: "#be123c" },
    ochem: { bg: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce" },
    mat: C.mat
  };

  const curLecs = lecSets[lecTab] || [];
  const filteredLecs = curLecs.filter(l => {
    const q = search.toLowerCase();
    const matches = !q || l.ch.toLowerCase().includes(q) || l.topic.toLowerCase().includes(q) || l.date.toLowerCase().includes(q);
    const k = `lec_${lecTab}_${l.n}`;
    const isDone = !!state[k];
    if (filterDone === "done" && !isDone) return false;
    if (filterDone === "pending" && isDone) return false;
    return matches;
  });
  const lecDone = curLecs.filter(l => !!state[`lec_${lecTab}_${l.n}`]).length;
  const totalLecs = Object.keys(lecSets).reduce((a, k) => a + lecSets[k].length, 0);
  const totalLecsDone = Object.keys(lecSets).reduce((a, k) =>
    a + lecSets[k].filter(l => !!state[`lec_${k}_${l.n}`]).length, 0);

  const TAB_STYLE = (active, col) => ({
    padding: "8px 4px", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 800,
    cursor: "pointer", background: active ? col : "#f3f4f6", color: active ? "#fff" : "#6b7280",
    transition: "all .15s", letterSpacing: .3
  });

  const MAIN_TAB = (id, label, active) => (
    <button
      key={id} onClick={() => setTab(id)}
      style={{
        flex: 1, padding: "11px 4px", border: "none", borderBottom: active ? "3px solid #4f46e5" : "3px solid transparent",
        background: "white", color: active ? "#4f46e5" : "#9ca3af", fontSize: 12, fontWeight: 800,
        cursor: "pointer", transition: "all .15s", letterSpacing: .3
      }}
    >{label}</button>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", maxWidth: 600, margin: "0 auto" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)", padding: "20px 16px 16px", color: "white" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: .7, marginBottom: 4 }}>PHYSICS WALLAH</div>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 2 }}>Prayas JEE 2026</div>
        <div style={{ fontSize: 12, opacity: .75, marginBottom: 14 }}>Complete Planner — Tests + Lectures (All dates 2026)</div>
        {/* Overall stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Tests Done", val: testDoneCount + "/" + TESTS.length, sub: Math.round(testDoneCount / TESTS.length * 100) + "%" },
            { label: "Lectures Done", val: totalLecsDone + "/" + totalLecs, sub: Math.round(totalLecsDone / totalLecs * 100) + "%" },
            { label: "JEE Advanced", val: "18 May", sub: "2026 🎯" }
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 900 }}>{s.val}</div>
              <div style={{ fontSize: 9, opacity: .7, marginTop: 1 }}>{s.label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a5f3fc", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN TABS */}
      <div style={{ display: "flex", background: "white", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 }}>
        {MAIN_TAB("tests", "📋 Tests", tab === "tests")}
        {MAIN_TAB("lecs", "🎬 Lectures", tab === "lecs")}
      </div>

      {/* ── TESTS TAB ─────────────────────────────────────────── */}
      {tab === "tests" && (
        <div>
          <SectionHead emoji="📋" title="Test Planner" sub={"26 Tests — May 2026 to May 2026"} />

          <div style={{ padding: "0 16px 8px" }}>
            <ProgBar done={testDoneCount} total={TESTS.length} color="#4f46e5" />
          </div>

          {/* Filter row */}
          <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", flexWrap: "wrap" }}>
            {["all", "Part Test", "Full Test"].map(f => (
              <button key={f} onClick={() => setFilterDone(f === filterDone ? "all" : f)}
                style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid #e5e7eb", background: filterDone === f ? "#4f46e5" : "white", color: filterDone === f ? "white" : "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>

          {TESTS.filter(t => filterDone === "all" || t.type === filterDone).map(t => {
            const k = "test_" + t.id;
            const done = !!state[k];
            const isAdv = t.pattern === "JEE Advanced";
            const isFull = t.type === "Full Test";
            const ac = isAdv ? { bg: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce" } : C.phy;

            return (
              <div key={t.id} style={{
                margin: "0 12px 10px",
                borderRadius: 12,
                border: `1.5px solid ${done ? "#bbf7d0" : ac.border}`,
                background: done ? "#f0fdf4" : "white",
                overflow: "hidden",
                transition: "all .2s"
              }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 10px" }}>
                  <Tick done={done} toggle={() => toggle(k)} color={ac.text} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af" }}>#{t.id}</span>
                      <Chip label={t.pattern} col={ac} />
                      {isFull && <Chip label="Full Syllabus" col={{ bg: "#fef9c3", border: "#fde047", text: "#854d0e" }} />}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: done ? "#9ca3af" : "#111827", textDecoration: done ? "line-through" : "none" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>📅 {t.date}</div>
                  </div>
                </div>

                {/* Syllabus breakdown */}
                {!isFull && (
                  <div style={{ borderTop: "1px solid #f3f4f6", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { label: "⚡ Physics", val: t.physics, col: C.phy },
                      { label: "🧪 Chemistry", val: t.chemistry, col: C.che },
                      { label: "📐 Maths", val: t.maths, col: C.mat },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: row.col.text, background: row.col.bg, padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1 }}>{row.label}</span>
                        <span style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ height: 24 }} />
        </div>
      )}

      {/* ── LECTURES TAB ────────────────────────────────────────── */}
      {tab === "lecs" && (
        <div>
          <SectionHead emoji="🎬" title="Lecture Planner" sub={`${totalLecsDone}/${totalLecs} lectures done`} />

          {/* Search */}
          <div style={{ padding: "0 12px 10px" }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search chapter or topic..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>

          {/* Filter */}
          <div style={{ display: "flex", gap: 5, padding: "0 12px 10px", flexWrap: "wrap" }}>
            {["all", "done", "pending"].map(f => (
              <button key={f} onClick={() => setFilterDone(filterDone === f ? "all" : f)}
                style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid #e5e7eb", background: filterDone === f ? "#4f46e5" : "white", color: filterDone === f ? "white" : "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {f === "all" ? "All" : f === "done" ? "✓ Done" : "⏳ Pending"}
              </button>
            ))}
          </div>

          {/* Subject tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 5, padding: "0 12px 12px" }}>
            {[
              { id: "phy", label: "⚡ Phy", col: "#4f46e5", total: PHYSICS_LECS.length },
              { id: "pchem", label: "🧪 PChem", col: "#ea580c", total: PCHEM_LECS.length },
              { id: "ichem", label: "⚗️ IChem", col: "#be123c", total: ICHEM_LECS.length },
              { id: "ochem", label: "🌿 OChem", col: "#7e22ce", total: OCHEM_LECS.length },
              { id: "mat", label: "📐 Math", col: "#16a34a", total: MATHS_LECS.length },
            ].map(s => {
              const d = lecSets[s.id].filter(l => !!state[`lec_${s.id}_${l.n}`]).length;
              return (
                <button key={s.id} onClick={() => setLecTab(s.id)} style={TAB_STYLE(lecTab === s.id, s.col)}>
                  <div>{s.label}</div>
                  <div style={{ fontSize: 9, marginTop: 2, opacity: lecTab === s.id ? 1 : .6 }}>{d}/{s.total}</div>
                </button>
              );
            })}
          </div>

          {/* Progress for current tab */}
          <div style={{ padding: "0 12px 6px" }}>
            <ProgBar done={lecDone} total={curLecs.length} color={lecFacultyColor[lecTab].text} />
          </div>

          {/* Lecture list */}
          <div style={{ background: "white", margin: "0 12px 16px", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            {filteredLecs.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                {search ? `No results for "${search}"` : "No lectures in this filter"}
              </div>
            ) : filteredLecs.map(lec => (
              <LecRow
                key={lec.n}
                lec={lec}
                done={!!state[`lec_${lecTab}_${lec.n}`]}
                toggle={() => toggle(`lec_${lecTab}_${lec.n}`)}
                chipColor={lecFacultyColor[lecTab]}
                chipLabel={lec.ch}
              />
            ))}
          </div>

          <div style={{ height: 24 }} />
        </div>
      )}
    </div>
  );
}
