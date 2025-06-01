export type Environment = {
    type: string;
    description: string;
    examples?: string;
  };
  
export type EnvironmentList = Environment[];


export type DimensionMoule = {
    cylindrique: number;
    cubique: number;
  };
  
  export type DimensionTypeElement = {
    sur_place: DimensionMoule;
    prefabrique: DimensionMoule;
  };
  
  export type QuantiteBeton = {
    [key: string]: DimensionTypeElement;
  };


