import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const NAVS = [
  { url: 'list', display: 'list', replace: true }, 
  { url: 'tags', display: 'tags', replace: true }, 
  { url: 'edit?new=true', display: 'new', replace: false }, 
  { url: 'analysis', display: 'ana', replace: true }, 
  { url: 'menu', display: 'menu', replace: true }, 
];

const Footer = () => {
  return (
    <ul className="Footer">
      {NAVS.map((x, i) => (
        <FooterItem key={i} nav={x} />
      ))}
    </ul>
  );
};

const FooterItem = ({ nav }) => (
  <li className="Divider">
    <NavLink to={'/' + nav.url} exact replace={nav.replace} 
      className="Nav" activeClassName="NavActive"
    >
      {nav.display}
    </NavLink>
  </li>
);

export default Footer;
