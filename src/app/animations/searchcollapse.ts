import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * The transition constant
 */
const transitionConst = [
	transition('opened => closed', [
		animate('0.3s 0s ease-in-out')
	]),
	transition('closed => opened', [
		animate('0.3s 0s ease-in-out')
	])
]

/**
 * The collapse animation
 */
export const collapseAnimation = [

	// The title collapse that
	// includes text-size manipulation
	trigger('collapseTitle', [
		state('opened', style({
			fontSize: '5rem'
		})),
		state('closed', style({
			fontSize: '3rem'
		})),
		...transitionConst
	]),

	// The subtitle collapse that
	// includes text-size manipulation
	trigger('collapseSubtitle', [
		state('opened', style({
			fontSize: '2rem'
		})),
		state('closed', style({
			fontSize: '1rem'
		})),
		...transitionConst
	]),

	// The description collapse that
	// includes opacity manipulation
	trigger('collapseDescription', [
		state('opened', style({
			'opacity': '1'
		})),
		state('closed', style({
			'opacity': '0'
		})),
		...transitionConst
	]),

	// The header collapse
	// padding-related animations
	trigger('collapseHeader', [
		state('opened', style({
			padding: '*'
		})),
		state('closed', style({
			padding: '20px 0 80px 0'
		}))
	])
];