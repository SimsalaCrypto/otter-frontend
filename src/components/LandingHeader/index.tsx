import { useEffect, useState } from 'react';
import './header.scss';
import { Link, Popper, Box, Fade, SvgIcon } from '@material-ui/core';
import HeaderLogo from './header-logo.png';
import LanguagePicker from '../LanguagePicker';
import { DiscordLink, DocsLink, GithubLink, TwitterLink, MediumLink } from 'src/constants';

export default function LandingHeader() {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);

  const [scrolled, setScrolled] = useState(false);
  const handleScroll = () => {
    const offset = window.scrollY;
    if (offset > 0) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
  }, []);
  let navbarClasses = ['landing-header'];
  if (scrolled) {
    navbarClasses.push('scrolled');
  }

  return (
    <header className={navbarClasses.join(' ')}>
      <a href="https://www.otterclam.finance" className="landing-header-logo">
        <img src={HeaderLogo} alt="logo" />
      </a>
      <Link href={TwitterLink}>Twitter</Link>
      <Link href={DiscordLink}>Discord</Link>
      <Link href={GithubLink}>Github</Link>
      <Link href={MediumLink}>Medium</Link>
      <LanguagePicker border={false} />
      {/* <Link href={DocsLink}>Docs</Link> */}
    </header>
  );
}
