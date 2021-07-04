import React, { PureComponent } from 'react';
import LayoutComponent from '../../common/Layout';
import AlgorithmComponent from './algorithms';

class HomeComponent extends PureComponent {
  render() {
    return (
      <LayoutComponent selectedKey={2}>
        <AlgorithmComponent />
      </LayoutComponent>
    );
  }
}
export default HomeComponent;
