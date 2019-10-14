import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <table className="Footer"><tbody><tr>
      {['list', 'tags', 'edit', 'ana', 'menu'].map((x, i) => (
        <FooterItem key={i} name={x} />
      ))}
    </tr></tbody></table>
  );
};

const FooterItem = ({ name }) => (
  <td className="Divider">
    <NavLink to={'/' + name} exact replace={doesReplace(name)} 
      className="Nav" activeClassName="NavActive"
    >
      {name}
    </NavLink>
  </td>
);

const doesReplace = (name) => (
  name != 'edit'
);

export default Footer;
