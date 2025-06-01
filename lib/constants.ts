import { EnvironmentList, QuantiteBeton } from './types';

export const CLASSE_EXPOSITIONS: EnvironmentList = [
  {
    type: 'X0',
    description: 'Béton non armé et sans pièces métalliques noyées - Toutes expositions sauf en cas de gel/dégel, d\'abrasion ou d\'attaque chimique - Béton armé ou avec des pièces métalliques noyées - très sec',
    examples: 'Béton à l\'intérieur de bâtiments où le taux d\'humidité de l\'air ambiant est très faible'
  },
  {
    type: 'XC1',
    description: 'Sec ou humide en permanence',
    examples: 'Béton à l\'intérieur de bâtiments où le taux d\'humidité de l\'air ambiant est faible - Béton submergé en permanence dans de l\'eau'
  },
  {
    type: 'XC2',
    description: 'Humide, rarement sec',
    examples: 'Surfaces de béton soumises au contact à long terme de l\'eau - Un grand nombre de fondations'
  },
  {
    type: 'XC3',
    description: 'Humidité modérée',
    examples: 'Béton à l\'intérieur de bâtiments où le taux d\'humidité de l\'air ambiant est moyen ou élevé - Béton extérieur abrité de la pluie'
  },
  {
    type: 'XC4',
    description: 'Alternativement humide et sec',
    examples: 'Surfaces de béton soumises au contact de l\'eau, mais n\'entrant pas dans la classe d\'exposition XC2'
  },
  {
    type: 'XD1',
    description: 'Humidité modérée',
    examples: 'Surfaces de béton exposées à des chlorures transportés par voie aérienne'
  },
  {
    type: 'XD2',
    description: 'Humide, rarement sec',
    examples: 'Piscines - Eléments en béton exposés à des eaux industrielles contenant des chlorures'
  },
  {
    type: 'XD3',
    description: 'Alternativement humide et sec',
    examples: 'Eléments de ponts, exposés à des projections contenant des chlorures - Chaussées - Dalles de parcs de stationnement de véhicules'
  },
  {
    type: 'XS1',
    description: 'Exposé à l\'air véhiculant du sel marin mais pas en contact direct avec l\'eau de mer',
    examples: 'Structures sur ou à proximité d\'une côte'
  },
  {
    type: 'XS2',
    description: 'Immergé en permanence',
    examples: 'Eléments de structures marines'
  },
  {
    type: 'XS3',
    description: 'Zones de marnage, zones soumises à des projections ou à des embruns',
    examples: 'Eléments de structures marines'
  },
  {
    type: 'XF1',
    description: 'Saturation modérée en eau, sans agent de déverglaçage',
    examples: 'Surfaces verticales de béton exposées à la pluie et au gel'
  },
  {
    type: 'XF2',
    description: 'Saturation modérée en eau, avec agents de déverglaçage',
    examples: 'Surfaces verticales de béton des ouvrages routiers exposées au gel et à l\'air véhiculant des agents de déverglaçage'
  },
  {
    type: 'XF3',
    description: 'Forte saturation en eau, sans agents de déverglaçage',
    examples: 'Surfaces horizontales de béton exposées à la pluie et au gel'
  },
  {
    type: 'XF4',
    description: 'Forte saturation en eau, avec agents de déverglaçage ou eau de mer',
    examples: 'Routes et tabliers de pont exposés aux agents de déver-glaçage - Surfaces de béton verticales directement exposées aux projections d\'agents de déverglaçage et au gel - Zones des structures marines soumises aux projections et exposées au gel'
  },
  {
    type: 'XA1',
    description: 'Environnement à faible agressivité chimique selon l\'EN 206-1, Tableau 2',
    examples: 'Sols naturels et eau dans le sol'
  },
  {
    type: 'XA2',
    description: 'Environnement d\'agressivité chimique modérée selon l\'EN 206-1, Tableau 2',
    examples: 'Sols naturels et eau dans le sol'
  },
  {
    type: 'XA3',
    description: 'Environnement à forte agressivité chimique selon l\'EN 206-1, Tableau 2',
    examples: 'Sols naturels et eau dans le sol'
  }
];

export const CLASSES_STRUCTURALES: QuantiteBeton = {
    X0: {
      sur_place: {
        cylindrique: 0,
        cubique: 0
      },
      prefabrique: {
        cylindrique: 20,
        cubique: 25
      }
    },
    XC1: {
      sur_place: {
        cylindrique: 20,
        cubique: 25
      },
      prefabrique: {
        cylindrique: 25,
        cubique: 30
      }
    },
    XC2: {
      sur_place: {
        cylindrique: 25,
        cubique: 30
      },
      prefabrique: {
        cylindrique: 30,
        cubique: 37
      }
    },
    XC3: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 35,
        cubique: 45
      }
    },
    XC4: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 35,
        cubique: 45
      }
    },
    XD1: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 35,
        cubique: 45
      }
    },
    XD2: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 40,
        cubique: 50
      }
    },
    XD3: {
      sur_place: {
        cylindrique: 35,
        cubique: 45
      },
      prefabrique: {
        cylindrique: 35,
        cubique: 45
      }
    },
    XS1: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 40,
        cubique: 50
      }
    },
    XS2: {
      sur_place: {
        cylindrique: 35,
        cubique: 45
      },
      prefabrique: {
        cylindrique: 40,
        cubique: 50
      }
    },
    XS3: {
      sur_place: {
        cylindrique: 35,
        cubique: 45
      },
      prefabrique: {
        cylindrique: 35,
        cubique: 45
      }
    },
    XF1: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 35,
        cubique: 45
      }
    },
    XF2: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 35,
        cubique: 45
      }
    },
    XF3: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 35,
        cubique: 45
      }
    },
    XF4: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 35,
        cubique: 45
      }
    },
    XA1: {
      sur_place: {
        cylindrique: 30,
        cubique: 37
      },
      prefabrique: {
        cylindrique: 40,
        cubique: 50
      }
    },
    XA2: {
      sur_place: {
        cylindrique: 35,
        cubique: 45
      },
      prefabrique: {
        cylindrique: 40,
        cubique: 50
      }
    },
    XA3: {
      sur_place: {
        cylindrique: 40,
        cubique: 50
      },
      prefabrique: {
        cylindrique: 40,
        cubique: 50
      }
    }
  };


export const TYPE_ACIER = {
  S400: {
    Fyk: 400,
    ey: 1.74 * Math.pow(10, -3),
    uy: 0.392
  }, 
  S500: {
    Fyk: 500,
    ey: 2.17 * Math.pow(10, -3),
    uy: 0.372
  },
}