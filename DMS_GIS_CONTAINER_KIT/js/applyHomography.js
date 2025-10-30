/**
 * DMS GIS Container Kit - applyHomography.js
 * Omografia px→mappa (DLT 4 punti)
 */

window.DMS = window.DMS || {};

(function() {
  const CRS = L.CRS.EPSG3857;

  /**
   * Risolve sistema lineare Ax = b (Gauss-Jordan)
   * @param {Array} A - Matrice coefficienti
   * @param {Array} b - Vettore termini noti
   * @returns {Array} Soluzione x
   */
  function solve(A, b) {
    const n = A.length;
    
    // Copia matrici
    A = A.map(row => [...row]);
    b = [...b];

    // Eliminazione di Gauss con pivoting parziale
    for (let i = 0; i < n; i++) {
      // Trova pivot massimo
      let max = i;
      for (let r = i + 1; r < n; r++) {
        if (Math.abs(A[r][i]) > Math.abs(A[max][i])) {
          max = r;
        }
      }

      // Scambia righe
      [A[i], A[max]] = [A[max], A[i]];
      [b[i], b[max]] = [b[max], b[i]];

      // Normalizza riga i
      const div = A[i][i];
      for (let j = i; j < n; j++) {
        A[i][j] /= div;
      }
      b[i] /= div;

      // Elimina colonna i dalle righe successive
      for (let r = 0; r < n; r++) {
        if (r !== i) {
          const f = A[r][i];
          for (let j = i; j < n; j++) {
            A[r][j] -= f * A[i][j];
          }
          b[r] -= f * b[i];
        }
      }
    }

    return b;
  }

  /**
   * Calcola matrice omografica H da 4 GCP
   * @param {Array} pxs - Array di 4 punti pixel [{x, y}, ...]
   * @param {Array} wms - Array di 4 punti WebMercator metri [{x, y}, ...]
   * @returns {Array} Matrice H 3x3 (array di array)
   */
  function computeHomography(pxs, wms) {
    const A = [];
    const b = [];

    for (let k = 0; k < 4; k++) {
      const x = pxs[k].x;
      const y = pxs[k].y;
      const X = wms[k].x;
      const Y = wms[k].y;

      // Equazioni DLT per X
      A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]);
      b.push(X);

      // Equazioni DLT per Y
      A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]);
      b.push(Y);
    }

    const h = solve(A, b);

    // Costruisci matrice 3x3
    return [
      [h[0], h[1], h[2]],
      [h[3], h[4], h[5]],
      [h[6], h[7], 1]
    ];
  }

  /**
   * Applica omografia H a un punto pixel
   * @param {Array} H - Matrice omografica 3x3
   * @param {number} x - Coordinata x pixel
   * @param {number} y - Coordinata y pixel
   * @returns {L.LatLng} Punto geografico
   */
  function applyH(H, x, y) {
    const w = H[2][0] * x + H[2][1] * y + H[2][2];
    const X = (H[0][0] * x + H[0][1] * y + H[0][2]) / w;
    const Y = (H[1][0] * x + H[1][1] * y + H[1][2]) / w;
    return CRS.unproject(L.point(X, Y));
  }

  // Esporta
  window.DMS = Object.assign(window.DMS, {
    computeHomography,
    applyH
  });
})();

