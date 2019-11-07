/**
 * The package's interface
 */
export interface IPackage {

  /**
   * The package's title
   */
  name: string;


  /**
   * The package's apps
   */
  apps: IApp[]
}
