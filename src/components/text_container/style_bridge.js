import styles from '@components/text_container/styles.module.scss';

export function get_class_names(name) {
  return styles[name] ?? name;
}