import styles from '@components/wrapper/styles.module.scss';

export function get_class_names(name) {
  return styles[name] ?? name;
}