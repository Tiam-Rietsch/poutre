// ====== CALCULS DES DONNÉES DE BASE ======

/**
 * Calcule la résistance moyenne du béton à la compression (fcm)
 * @param Fck Résistance caractéristique du béton à 28 jours (en MPa)
 * @returns fcm = Fck + 8 (en MPa)
 */
export function calculeFcm(Fck: number): number {
    return Fck + 8;
}

/**
 * Calcule la résistance de calcul du béton en compression (fcd)
 * @param Fck Résistance caractéristique du béton à 28 jours (en MPa)
 * @returns fcd = Fck / 1.5 (en MPa)
 */
export function calculeFc(Fck: number): number {
    return Fck / 1.5;
}

/**
 * Calcule la résistance moyenne du béton à la traction (fctm)
 * @param Fck Résistance caractéristique du béton à 28 jours (en MPa)
 * @returns fctm = 0.3 × Fck^(2/3) (en MPa)
 */
export function calculeFctm(Fck: number): number {
    return 0.3 * Math.pow(Fck, 2 / 3);
}

/**
 * Calcule le module d'élasticité du béton (Ecm)
 * @param Fcm Résistance moyenne du béton à la compression (en MPa)
 * @returns Ecm = 22000 × (Fcm/10)^0.3 (en MPa)
 */
export function calculeEcm(Fcm: number): number {
    return 22000 * Math.pow((Fcm / 10), 0.3);
}

/**
 * Calcule la résistance de calcul de l’acier (fyd)
 * @param Fyk Résistance caractéristique de l’acier (en MPa)
 * @returns fyd = Fyk / 1.15 (en MPa)
 */
export function calculeFyd(Fyk: number): number {
    return Fyk / 1.15;
}

/**
 * Calcule le paramètre ξy pour déterminer si l’on est dans une section sans armature comprimée
 * @param ey Déformation limite de l’acier (en m/m)
 * @returns ξy = ec / (ec + ey)
 */
export function calculeParametreEy(ey: number): number {
    const ec = 3.5e-3;
    return ec / (ec + ey);
}

// ====== CALCUL FONCTIONNEL (FLEXION SIMPLE) ======

/**
 * Calcule le moment réduit ultime de référence (μ)
 * @param Med Moment de flexion ultime (en kN·m)
 * @param b Largeur de la poutre (en m)
 * @param d Hauteur utile de la poutre (en m)
 * @param Fcd Résistance de calcul du béton (en MPa)
 * @returns μ = Med / (b × d² × Fcd)
 */
export function calculeMomentReduitUltimeDeReference(Med: number, b: number, d: number, Fcd: number): number {
    return Med / (b * Math.pow(d, 2) * Fcd);
}

/**
 * Vérifie si la section peut être traitée sans armature comprimée
 * @param parametreU Moment réduit réel (μ)
 * @param parametreUy Valeur limite pour section sans armature comprimée (ξy)
 * @returns true si section sans armature comprimée
 */
export function estSansArmatureComprime(parametreU: number, parametreUy: number): boolean {
    return parametreU <= parametreUy;
}

// ====== SECTION SANS ARMATURE COMPRIMÉE ======

/**
 * Calcule le paramètre ξ (épaisseur relative de béton comprimé)
 * @param parametreU Moment réduit réel (μ)
 * @returns ξ = 1.25 × (1 - √(1 - 2μ))
 */
export function calculeParametreE(parametreU: number): number {
    return 1.25 * (1 - Math.sqrt(1 - 2 * parametreU));
}

/**
 * Calcule l’épaisseur de la zone comprimée en béton
 * @param d Hauteur utile (en m)
 * @param parametreE Paramètre ξ
 * @returns x = d × ξ (en m)
 */
export function calculeEpaisseurDuBetonComprime(d: number, parametreE: number): number {
    return d * parametreE;
}

/**
 * Calcule le bras de levier des forces internes
 * @param d Hauteur utile (en m)
 * @param x Hauteur de la zone comprimée (en m)
 * @returns z = d - 0.4 × x (en m)
 */
export function calculeBrasDeLevierDesForcesInternes(d: number, x: number): number {
    return d - 0.4 * x;
}

/**
 * Calcule la déformation de l'acier tendu
 * @param d Hauteur utile (en m)
 * @param x Épaisseur de la zone comprimée (en m)
 * @returns εs = (d - x) / x × ec (en m/m)
 */
export function calculeDeformationAcier(d: number, x: number): number {
    const ec = 3.5e-3;
    return ((d - x) / x) * ec;
}

/**
 * Calcule la contrainte dans l’acier en régime pseudo-plastique (classe B)
 * @param Fyd Résistance de calcul de l’acier (en MPa)
 * @param Es Déformation réelle de l’acier (en m/m)
 * @param Ey Déformation limite de l’acier (en m/m)
 * @returns σs (en MPa)
 */
export function calculeContrainteAcierS500(Fyd: number, Es: number, Ey: number): number {
    const k = 1.08;
    const euk = 5e-3;
    return Fyd * (k + ((Es - euk) * (k - 1)) / (euk - Ey));
}

/**
 * Calcule la section d'armature requise
 * @param Med Moment de flexion (en kN·m)
 * @param Os Contrainte admissible de l’acier (en MPa)
 * @param Z Bras de levier des forces (en m)
 * @returns As = Med / (Os × Z) (en m²)
 */
export function calculeSectionArmature(Med: number, Os: number, Z: number): number {
    return Med / (Os * Z);
}

/**
 * Calcule la section minimale d’acier requise pour la non-fragilité
 * @param b Largeur de la poutre (en m)
 * @param d Hauteur utile (en m)
 * @param fctm Résistance à la traction moyenne du béton (en MPa)
 * @param Fyk Résistance caractéristique de l’acier (en MPa)
 * @returns As_min (en m²)
 */
export function calculeConditionNonFragiliteSCAS(b: number, d: number, fctm: number, Fyk: number): number {
    return (0.26 * b * d * fctm) / Fyk;
}

/**
 * Calcule la section théorique d'armature finale (contrainte par As_min)
 * @param As_calc Section d’acier calculée (en m²)
 * @param As_min Section minimale exigée (en m²)
 * @returns As_théo = max(As_calc, As_min) (en m²)
 */
export function calculeTheoriqueArmatureSCAS(As_calc: number, As_min: number): number {
    return Math.max(As_calc, As_min);
}


// ==================== SECTION AVEC ARMATURE COMPRIMÉE ====================

/**
 * Calcule le moment repris par le béton tendu
 * @param Z Bras de levier (en m)
 * @param As Section d’acier tendu (en m²)
 * @param Fyd Résistance de calcul de l’acier (en MPa)
 * @returns Mu1 = Z × As × Fyd (en kN·m)
 */
export function calculeMomentReprisParAcierTendu(Z: number, As: number, Fyd: number): number {
    return Z * As * Fyd;
}

/**
 * Calcule le moment repris par l’armature comprimée
 * @param Med Moment total de flexion (en kN·m)
 * @param Mu1 Moment repris par l’acier tendu (en kN·m)
 * @returns Mu2 = Med - Mu1 (en kN·m)
 */
export function calculeMomentReprisParAcierComprime(Med: number, Mu1: number): number {
    return Med - Mu1;
}

/**
 * Calcule la section d’armature comprimée nécessaire
 * @param Mu2 Moment repris par l’acier comprimé (en kN·m)
 * @param Fyd Résistance de calcul de l’acier (en MPa)
 * @param Zc Bras de levier de la zone comprimée (en m)
 * @returns A's = Mu2 / (Zc × Fyd) (en m²)
 */
export function calculeSectionArmatureComprimee(Mu2: number, Fyd: number, Zc: number): number {
    return Mu2 / (Zc * Fyd);
}

/**
 * Calcule le bras de levier des forces internes côté armature comprimée
 * @param d Hauteur utile de la poutre (en m)
 * @param x Épaisseur zone comprimée (en m)
 * @returns Zc = d - 0.4 × x (en m)
 */
export function calculeBrasDeLevierZoneComprimee(d: number, x: number): number {
    return d - 0.4 * x;
}

/**
 * Calcule la contrainte admissible dans l’acier tendu (σs)
 * @param Fyd Résistance de calcul de l’acier (en MPa)
 * @returns σs = Fyd (en MPa), supposant comportement plastique parfait
 */
export function calculeContrainteAcierTendu(Fyd: number): number {
    return Fyd;
}

/**
 * Calcule la section d’armature tendue dans le cas SAAC
 * @param Med Moment total de flexion (en kN·m)
 * @param Fyd Contrainte d’acier (en MPa)
 * @param Z Bras de levier (en m)
 * @returns As = Med / (Z × Fyd) (en m²)
 */
export function calculeSectionArmatureTendueAvecCompression(Med: number, Fyd: number, Z: number): number {
    return Med / (Z * Fyd);
}

/**
 * Calcule la section minimale d’acier pour la condition de non-fragilité
 * @param b Largeur de la poutre (en m)
 * @param d Hauteur utile (en m)
 * @param fctm Résistance moyenne à la traction du béton (en MPa)
 * @param Fyk Résistance caractéristique de l’acier (en MPa)
 * @returns As_min = (0.26 × b × d × fctm) / Fyk (en m²)
 */
export function calculeConditionNonFragiliteSAAS(b: number, d: number, fctm: number, Fyk: number): number {
    return (0.26 * b * d * fctm) / Fyk;
}

/**
 * Calcule la section théorique finale d’armature tendue
 * @param As_calc Section calculée (en m²)
 * @param As_min Section minimale requise (en m²)
 * @returns As_théo = max(As_calc, As_min) (en m²)
 */
export function calculeTheoriqueArmatureSAAS(As_calc: number, As_min: number): number {
    return Math.max(As_calc, As_min);
}
