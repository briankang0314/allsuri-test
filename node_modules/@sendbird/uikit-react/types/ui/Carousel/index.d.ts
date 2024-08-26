import './index.scss';
import { ReactElement } from 'react';
interface CarouselProps {
    id: string;
    items: ReactElement[];
    gap?: number;
}
export declare function Carousel({ id, items, gap, }: CarouselProps): ReactElement;
export default Carousel;
