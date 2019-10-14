import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <div className="Footer">
      {['list', 'tags', 'edit', 'ana', 'menu'].map((x) => (<FooterItem name={x} />))}
    </div>
  );
};

const FooterItem = ({ name }) => (
  <div className="Divider">
    <NavLink to={'/' + name} exact replace 
      className="Nav" activeClassName="NavActive"
    >
      {name}
    </NavLink>
  </div>
);

export default Footer;
