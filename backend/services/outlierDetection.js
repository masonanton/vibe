exports.findOutliers = (audioFeatures, threshold = 2) => {
    const featuresToCheck = ['danceability', 'energy', 'tempo'];
    const count = audioFeatures.length;
  
    const mean = {};
    const stdDev = {};
  
    // Initialize means and standard deviations
    featuresToCheck.forEach(f => {
      mean[f] = 0;
      stdDev[f] = 0;
    });
  
    // Compute means
    audioFeatures.forEach(feature => {
      featuresToCheck.forEach(f => {
        mean[f] += feature[f];
      });
    });
    featuresToCheck.forEach(f => {
      mean[f] /= count;
    });
  
    // Compute standard deviations
    audioFeatures.forEach(feature => {
      featuresToCheck.forEach(f => {
        stdDev[f] += Math.pow(feature[f] - mean[f], 2);
      });
    });
    featuresToCheck.forEach(f => {
      stdDev[f] = Math.sqrt(stdDev[f] / count);
    });
  
    // Detect outliers
    const outliers = audioFeatures.filter(feature => {
      return featuresToCheck.some(f =>
        Math.abs(feature[f] - mean[f]) > threshold * stdDev[f]
      );
    });
  
    return outliers;
  };
  