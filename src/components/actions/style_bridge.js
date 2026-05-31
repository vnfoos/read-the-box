import styles from '@components/actions/styles.module.scss';

export function get_class_names(name) {
  return styles[name] ?? name;
}